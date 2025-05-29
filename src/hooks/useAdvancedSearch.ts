import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Product } from '../data/products';
import { FuzzySearchEngine, SearchResult } from '../utils/fuzzySearch';
import { useDebounce } from './useDebounce';

export interface UseAdvancedSearchConfig {
  products: Product[];
  debounceMs?: number;
  maxResults?: number;
  fuzzyThreshold?: number;
  enableCache?: boolean;
}

export interface UseAdvancedSearchReturn {
  searchResults: SearchResult[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
  hasResults: boolean;
  isEmpty: boolean;
  isSearching: boolean;
}

export function useAdvancedSearch(
  config: UseAdvancedSearchConfig
): UseAdvancedSearchReturn {
  const {
    products,
    debounceMs = 300,
    maxResults = 10,
    fuzzyThreshold = 0.6,
    enableCache = true
  } = config;

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchEngineRef = useRef<FuzzySearchEngine>();
  const abortControllerRef = useRef<AbortController>();

  // Create or update search engine when products change
  useEffect(() => {
    try {
      searchEngineRef.current = new FuzzySearchEngine(products, {
        maxResults,
        fuzzyThreshold,
        enablePhonetic: true,
        enableNGram: true,
        enableSemantic: true
      });
      setError(null);
    } catch (err) {
      setError('Erro ao inicializar o sistema de busca');
      console.error('Search engine initialization error:', err);
    }
  }, [products, maxResults, fuzzyThreshold]);

  // Debounced search query
  const debouncedQuery = useDebounce(searchQuery, debounceMs);

  // Perform search
  const performSearch = useCallback(async (query: string): Promise<SearchResult[]> => {
    if (!query.trim()) {
      return [];
    }

    if (!searchEngineRef.current) {
      throw new Error('Sistema de busca não está disponível');
    }

    // Simulate async operation for potential future API calls
    return new Promise((resolve, reject) => {
      const controller = new AbortController();
      abortControllerRef.current = controller;

      // Use setTimeout to make it async and allow for cancellation
      const timeoutId = setTimeout(() => {
        if (controller.signal.aborted) {
          reject(new Error('Busca cancelada'));
          return;
        }

        try {
          const results = searchEngineRef.current!.search(query);
          resolve(results);
        } catch (err) {
          reject(err);
        }
      }, 0);

      controller.signal.addEventListener('abort', () => {
        clearTimeout(timeoutId);
        reject(new Error('Busca cancelada'));
      });
    });
  }, []);

  // Execute search when debounced query changes
  useEffect(() => {
    const executeSearch = async () => {
      // Cancel previous search
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      if (!debouncedQuery.trim()) {
        setSearchResults([]);
        setIsLoading(false);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const results = await performSearch(debouncedQuery);
        setSearchResults(results);
      } catch (err) {
        if (err instanceof Error && err.message !== 'Busca cancelada') {
          setError('Erro durante a busca. Tente novamente.');
          console.error('Search error:', err);
        }
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    executeSearch();

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [debouncedQuery, performSearch]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setError(null);
    setIsLoading(false);
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Computed states
  const hasResults = searchResults.length > 0;
  const isEmpty = !isLoading && debouncedQuery.trim().length > 0 && !hasResults && !error;
  const isSearching = searchQuery !== debouncedQuery || isLoading;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    searchResults,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    clearSearch,
    hasResults,
    isEmpty,
    isSearching
  };
}