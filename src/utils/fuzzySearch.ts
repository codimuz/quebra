import { Product } from '../data/products';

export enum MatchType {
  EAN_EXACT = 'ean_exact',
  EAN_PARTIAL = 'ean_partial', 
  DESCRIPTION_EXACT = 'description_exact',
  DESCRIPTION_FUZZY = 'description_fuzzy',
  DESCRIPTION_SEMANTIC = 'description_semantic'
}

export interface SearchResult {
  product: Product;
  score: number;
  matchType: MatchType;
  matchedText?: string;
  highlightRanges?: Array<{ start: number; end: number }>;
}

interface FuzzySearchConfig {
  maxResults: number;
  fuzzyThreshold: number;
  enablePhonetic: boolean;
  enableNGram: boolean;
  enableSemantic: boolean;
}

const DEFAULT_CONFIG: FuzzySearchConfig = {
  maxResults: 10,
  fuzzyThreshold: 0.6,
  enablePhonetic: true,
  enableNGram: true,
  enableSemantic: true
};

export class FuzzySearchEngine {
  private config: FuzzySearchConfig;
  private products: Product[];
  private queryCache = new Map<string, SearchResult[]>();

  constructor(products: Product[], config: Partial<FuzzySearchConfig> = {}) {
    this.products = products;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  search(query: string): SearchResult[] {
    if (!query?.trim()) return [];

    const normalizedQuery = this.normalizeQuery(query);
    
    // Check cache first
    if (this.queryCache.has(normalizedQuery)) {
      return this.queryCache.get(normalizedQuery)!;
    }

    const results = this.performSearch(normalizedQuery);
    
    // Cache results
    this.queryCache.set(normalizedQuery, results);
    
    // Limit cache size
    if (this.queryCache.size > 100) {
      const firstKey = this.queryCache.keys().next().value;
      if (firstKey) {
        this.queryCache.delete(firstKey);
      }
    }

    return results;
  }

  private normalizeQuery(query: string): string {
    return query
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); // Remove diacritics
  }

  private performSearch(query: string): SearchResult[] {
    const results: SearchResult[] = [];

    for (const product of this.products) {
      const eanResult = this.searchEAN(product, query);
      if (eanResult) {
        results.push(eanResult);
        continue;
      }

      const descriptionResult = this.searchDescription(product, query);
      if (descriptionResult) {
        results.push(descriptionResult);
      }
    }

    return this.scoreAndSort(results);
  }

  private searchEAN(product: Product, query: string): SearchResult | null {
    const ean = product.ean.toLowerCase();

    // Exact EAN match
    if (ean === query) {
      return {
        product,
        score: 10000,
        matchType: MatchType.EAN_EXACT,
        matchedText: product.ean,
        highlightRanges: [{ start: 0, end: product.ean.length }]
      };
    }

    // Partial EAN match (starts with)
    if (ean.startsWith(query)) {
      const matchRatio = query.length / ean.length;
      return {
        product,
        score: 8000 + (matchRatio * 1000),
        matchType: MatchType.EAN_PARTIAL,
        matchedText: product.ean,
        highlightRanges: [{ start: 0, end: query.length }]
      };
    }

    return null;
  }

  private searchDescription(product: Product, query: string): SearchResult | null {
    const description = this.normalizeQuery(product.description);
    const queryWords = query.split(/\s+/).filter(w => w.length > 0);

    // Exact description match
    if (description.includes(query)) {
      const startIndex = description.indexOf(query);
      return {
        product,
        score: 6000 + (query.length / description.length * 1000),
        matchType: MatchType.DESCRIPTION_EXACT,
        matchedText: product.description,
        highlightRanges: [{ start: startIndex, end: startIndex + query.length }]
      };
    }

    // Word-by-word exact matches
    const exactWordMatches = this.findExactWordMatches(description, queryWords);
    if (exactWordMatches.score > 0) {
      return {
        product,
        score: 5000 + exactWordMatches.score,
        matchType: MatchType.DESCRIPTION_EXACT,
        matchedText: product.description,
        highlightRanges: exactWordMatches.ranges
      };
    }

    // Fuzzy matching
    if (this.config.enableNGram || this.config.enablePhonetic) {
      const fuzzyResult = this.fuzzyMatch(description, query, product.description);
      if (fuzzyResult && fuzzyResult.score >= this.config.fuzzyThreshold * 1000) {
        return {
          product,
          score: fuzzyResult.score,
          matchType: MatchType.DESCRIPTION_FUZZY,
          matchedText: product.description,
          highlightRanges: fuzzyResult.ranges
        };
      }
    }

    // Semantic matching
    if (this.config.enableSemantic) {
      const semanticScore = this.semanticMatch(description, queryWords);
      if (semanticScore > 100) {
        return {
          product,
          score: semanticScore,
          matchType: MatchType.DESCRIPTION_SEMANTIC,
          matchedText: product.description
        };
      }
    }

    return null;
  }

  private findExactWordMatches(description: string, queryWords: string[]): { score: number; ranges: Array<{ start: number; end: number }> } {
    let totalScore = 0;
    const ranges: Array<{ start: number; end: number }> = [];
    const descriptionWords = description.split(/\s+/);

    for (const queryWord of queryWords) {
      if (queryWord.length < 2) continue;

      for (let i = 0; i < descriptionWords.length; i++) {
        const descWord = descriptionWords[i];
        if (descWord.includes(queryWord)) {
          const wordScore = (queryWord.length / descWord.length) * 200;
          totalScore += wordScore;
          
          // Calculate position in original text for highlighting
          const beforeWords = descriptionWords.slice(0, i).join(' ');
          const start = beforeWords.length + (beforeWords.length > 0 ? 1 : 0);
          ranges.push({ start, end: start + descWord.length });
        }
      }
    }

    return { score: totalScore, ranges };
  }

  private fuzzyMatch(description: string, query: string, originalDescription: string): { score: number; ranges: Array<{ start: number; end: number }> } | null {
    const descWords = description.split(/\s+/);
    const queryWords = query.split(/\s+/);
    let totalScore = 0;
    const ranges: Array<{ start: number; end: number }> = [];

    for (const queryWord of queryWords) {
      if (queryWord.length < 2) continue;

      let bestWordScore = 0;
      let bestWordIndex = -1;

      for (let i = 0; i < descWords.length; i++) {
        const descWord = descWords[i];
        
        // Levenshtein distance
        const distance = this.levenshteinDistance(queryWord, descWord);
        const maxLength = Math.max(queryWord.length, descWord.length);
        const similarity = (maxLength - distance) / maxLength;

        if (similarity > bestWordScore && similarity >= this.config.fuzzyThreshold) {
          bestWordScore = similarity;
          bestWordIndex = i;
        }

        // N-gram similarity
        if (this.config.enableNGram) {
          const ngramSimilarity = this.ngramSimilarity(queryWord, descWord);
          if (ngramSimilarity > bestWordScore && ngramSimilarity >= this.config.fuzzyThreshold) {
            bestWordScore = ngramSimilarity;
            bestWordIndex = i;
          }
        }
      }

      if (bestWordScore > 0 && bestWordIndex !== -1) {
        totalScore += bestWordScore * 800;
        
        // Calculate highlighting range
        const beforeWords = descWords.slice(0, bestWordIndex).join(' ');
        const start = beforeWords.length + (beforeWords.length > 0 ? 1 : 0);
        ranges.push({ start, end: start + descWords[bestWordIndex].length });
      }
    }

    return totalScore > 0 ? { score: totalScore, ranges } : null;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) {
      matrix[0][i] = i;
    }

    for (let j = 0; j <= str2.length; j++) {
      matrix[j][0] = j;
    }

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // insertion
          matrix[j - 1][i] + 1, // deletion
          matrix[j - 1][i - 1] + substitutionCost // substitution
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  private ngramSimilarity(str1: string, str2: string, n: number = 2): number {
    const ngrams1 = this.getNgrams(str1, n);
    const ngrams2 = this.getNgrams(str2, n);
    
    if (ngrams1.size === 0 && ngrams2.size === 0) return 1;
    if (ngrams1.size === 0 || ngrams2.size === 0) return 0;

    const intersection = new Set([...ngrams1].filter(x => ngrams2.has(x)));
    const union = new Set([...ngrams1, ...ngrams2]);
    
    return intersection.size / union.size;
  }

  private getNgrams(str: string, n: number): Set<string> {
    const ngrams = new Set<string>();
    const paddedStr = ' '.repeat(n - 1) + str + ' '.repeat(n - 1);
    
    for (let i = 0; i < paddedStr.length - n + 1; i++) {
      ngrams.add(paddedStr.substring(i, i + n));
    }
    
    return ngrams;
  }

  private semanticMatch(description: string, queryWords: string[]): number {
    const descWords = description.split(/\s+/);
    let score = 0;

    // Simple keyword matching with stemming-like approach
    for (const queryWord of queryWords) {
      if (queryWord.length < 3) continue;

      for (const descWord of descWords) {
        // Root matching (simple stemming)
        const queryRoot = queryWord.substring(0, Math.max(3, queryWord.length - 2));
        const descRoot = descWord.substring(0, Math.max(3, descWord.length - 2));
        
        if (descRoot.includes(queryRoot) || queryRoot.includes(descRoot)) {
          score += 150;
        }
      }
    }

    return score;
  }

  private scoreAndSort(results: SearchResult[]): SearchResult[] {
    return results
      .sort((a, b) => {
        // Primary sort by score
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        
        // Secondary sort by match type priority
        const matchTypePriority = {
          [MatchType.EAN_EXACT]: 5,
          [MatchType.EAN_PARTIAL]: 4,
          [MatchType.DESCRIPTION_EXACT]: 3,
          [MatchType.DESCRIPTION_FUZZY]: 2,
          [MatchType.DESCRIPTION_SEMANTIC]: 1
        };
        
        return matchTypePriority[b.matchType] - matchTypePriority[a.matchType];
      })
      .slice(0, this.config.maxResults);
  }

  clearCache(): void {
    this.queryCache.clear();
  }

  updateProducts(products: Product[]): void {
    this.products = products;
    this.clearCache();
  }
}