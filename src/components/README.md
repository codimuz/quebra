# 🔍 SearchWithChips - Componente Avançado de Busca

## 📋 Visão Geral

O componente `SearchWithChips` é uma solução completa e avançada para busca de produtos em React Native, implementando algoritmos fuzzy sofisticados, navegação por teclado completa, e total acessibilidade seguindo as diretrizes do Material Design 3 através do react-native-paper.

## ✨ Funcionalidades Principais

### 🧠 Sistema de Busca Inteligente
- **Priorização por EAN**: Busca hierárquica com EAN tendo prioridade absoluta
- **Algoritmos Fuzzy**: Correção de erros de digitação e correspondências parciais
- **Busca Semântica**: Reconhecimento de palavras relacionadas e sinônimos
- **Debouncing Otimizado**: Performance aprimorada com cancelamento de buscas
- **Cache Inteligente**: Armazenamento temporário de resultados para melhor UX

### ⌨️ Navegação e Acessibilidade
- **Navegação por Teclado**: Arrow Up/Down, Enter, Escape, Home, End
- **ARIA Compliant**: Suporte completo a screen readers
- **Focus Management**: Controle inteligente de foco
- **Estados Visuais**: Loading, error, empty states com feedback claro

### 📱 Responsividade e UX
- **Adaptação de Teclado**: Posicionamento dinâmico baseado no teclado virtual
- **Highlight de Busca**: Realce visual dos termos encontrados
- **Chips Interativos**: Seleção visual com capacidade de remoção
- **Material Design 3**: Aderência estrita ao sistema de design

## 🛠️ Uso Básico

```tsx
import SearchWithChips from './components/SearchWithChips';
import { PRODUCTS } from './data/products';

function App() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  return (
    <SearchWithChips
      products={PRODUCTS}
      onSelectionChange={setSelectedProduct}
      label="Buscar Produtos"
      placeholder="Digite EAN ou descrição do produto..."
    />
  );
}
```

## 🔧 Props API

### Props Principais

```tsx
interface SearchWithChipsProps {
  // Dados
  products: Product[];                              // Array de produtos para busca
  onSelectionChange: (product: Product | null) => void; // Callback de seleção
  
  // Configuração de Interface
  label?: string;                                   // Label do input (padrão: "Buscar Produtos")
  placeholder?: string;                             // Placeholder do input
  disabled?: boolean;                               // Estado desabilitado
  autoFocus?: boolean;                              // Auto-foco ao montar
  allowClear?: boolean;                             // Permitir limpar seleção (padrão: true)
  
  // Configuração de Busca
  maxResults?: number;                              // Máximo de resultados (padrão: 10)
  debounceMs?: number;                              // Delay do debounce (padrão: 300ms)
  fuzzyThreshold?: number;                          // Limite de similaridade fuzzy (padrão: 0.6)
  
  // Estados Externos
  loading?: boolean;                                // Estado de loading externo
  error?: string;                                   // Mensagem de erro externa
  
  // Acessibilidade
  ariaLabel?: string;                               // Label de acessibilidade
  testID?: string;                                  // ID para testes
}
```

### Interface do Produto

```tsx
interface Product {
  ean: string;                                      // Código EAN (European Article Number)
  price: number;                                    // Preço do produto
  description: string;                              // Descrição do produto
}
```

## 🎯 Exemplos Avançados

### Configuração Personalizada

```tsx
<SearchWithChips
  products={products}
  onSelectionChange={handleSelection}
  label="Buscar por EAN ou Descrição"
  placeholder="Ex: 7891234567890 ou smartphone"
  maxResults={15}
  debounceMs={200}
  fuzzyThreshold={0.7}
  autoFocus={true}
  testID="product-search"
  ariaLabel="Campo de busca de produtos com suporte a EAN e descrição"
/>
```

### Com Estados Externos

```tsx
function ProductSearch() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleSelectionChange = async (product: Product | null) => {
    setSelectedProduct(product);
    
    if (product) {
      setIsLoading(true);
      try {
        await validateProductAvailability(product.ean);
        setError(null);
      } catch (err) {
        setError('Produto não disponível no estoque');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <SearchWithChips
      products={PRODUCTS}
      onSelectionChange={handleSelectionChange}
      loading={isLoading}
      error={error}
      disabled={isLoading}
    />
  );
}
```

## 🔍 Algoritmo de Busca

### Hierarquia de Prioridade

1. **EAN Exato** (Score: 10000)
   ```
   Busca: "7891234567890"
   Resultado: Produto com EAN exato
   ```

2. **EAN Parcial** (Score: 8000-9000)
   ```
   Busca: "789123"
   Resultado: Produtos cujo EAN começa com "789123"
   ```

3. **Descrição Exata** (Score: 6000-7000)
   ```
   Busca: "smartphone"
   Resultado: Produtos que contêm "smartphone" na descrição
   ```

4. **Descrição Fuzzy** (Score: 1000-5000)
   ```
   Busca: "smartfone" (erro de digitação)
   Resultado: Produtos com "smartphone" usando algoritmo Levenshtein
   ```

5. **Correspondência Semântica** (Score: 100-999)
   ```
   Busca: "celular"
   Resultado: Produtos relacionados usando análise de palavras-chave
   ```

### Algoritmos Implementados

#### Levenshtein Distance
- Correção de erros de digitação
- Transposições de caracteres
- Inserções e deleções

#### N-gram Analysis
- Análise de bigrams e trigrams
- Jaccard similarity coefficient
- Pontuação baseada em posição

#### Busca Fonética
- Soundex adaptado para português
- Correção de erros fonéticos comuns
- Acentuação inteligente

## ⌨️ Navegação por Teclado

### Teclas Suportadas

| Tecla | Ação |
|-------|------|
| `Arrow Down` | Navegar para próximo resultado |
| `Arrow Up` | Navegar para resultado anterior |
| `Enter` | Selecionar item ativo |
| `Escape` | Fechar dropdown e limpar busca |
| `Home` | Ir para primeiro resultado |
| `End` | Ir para último resultado |
| `Tab` | Fechar dropdown (navegação sequencial) |
| `Backspace` | Remover chip se campo vazio |

### Estados de Navegação

```tsx
// Hook interno de navegação
const navigation = useKeyboardNavigation({
  itemCount: searchResults.length,
  onSelect: handleItemSelect,
  onEscape: handleEscape,
  loop: true,                    // Navegação circular
  disabled: !showDropdown        // Desabilitar quando fechado
});
```

## 🎨 Personalização Visual

### Temas Suportados
- Material Design 3 Light
- Material Design 3 Dark
- Personalização automática via react-native-paper

### Componentes Visuais

#### Estados do Input
```tsx
// Normal
<TextInput mode="outlined" />

// Com produto selecionado
<TextInput 
  mode="outlined" 
  contentStyle={{ paddingLeft: 120 }} 
/>

// Loading
<TextInput 
  right={<TextInput.Icon icon="loading" disabled />}
/>

// Com botão limpar
<TextInput 
  right={<TextInput.Icon icon="close" onPress={clearSearch} />}
/>
```

#### Dropdown Estados
- **Loading**: Spinner + "Buscando produtos..."
- **Empty**: "Nenhum produto encontrado" + dicas
- **Error**: Mensagem de erro com ícone
- **Results**: Lista de produtos com highlight

#### Chip do Produto
```tsx
<ProductChip
  product={selectedProduct}
  onRemove={handleRemove}
  maxLength={20}
  variant="flat"
  showPrice={false}
/>
```

## 🧪 Testes

### Cenários de Teste

#### Busca por EAN
```tsx
// Teste: EAN exato
it('should find exact EAN match', () => {
  const result = searchEngine.search('7891234567890');
  expect(result[0].matchType).toBe(MatchType.EAN_EXACT);
  expect(result[0].score).toBe(10000);
});

// Teste: EAN parcial
it('should find partial EAN match', () => {
  const result = searchEngine.search('789123');
  expect(result[0].matchType).toBe(MatchType.EAN_PARTIAL);
  expect(result[0].score).toBeGreaterThan(8000);
});
```

#### Busca Fuzzy
```tsx
// Teste: Correção de erro
it('should correct typing errors', () => {
  const result = searchEngine.search('smartfone');
  expect(result[0].product.description).toContain('smartphone');
  expect(result[0].matchType).toBe(MatchType.DESCRIPTION_FUZZY);
});
```

#### Navegação por Teclado
```tsx
// Teste: Arrow Down
it('should navigate down with arrow key', () => {
  const { navigation } = renderHook(() => useKeyboardNavigation({
    itemCount: 5,
    onSelect: jest.fn()
  }));
  
  act(() => {
    navigation.handleKeyDown({ key: 'ArrowDown' });
  });
  
  expect(navigation.activeIndex).toBe(0);
});
```

### TestIDs Disponíveis
```tsx
testID="search-with-chips"           // Container principal
testID="search-with-chips-input"     // Input de busca
testID="search-with-chips-chip"      // Chip do produto selecionado
testID="search-with-chips-clear"     // Botão limpar
testID="search-with-chips-dropdown"  // Dropdown de resultados
testID="search-result-0"             // Item de resultado (índice)
testID="search-loading"              // Indicador de loading
```

## 🚀 Performance

### Otimizações Implementadas

#### Debouncing Inteligente
```tsx
const debouncedQuery = useDebounce(searchQuery, 300);
```

#### Memoização
```tsx
const searchResults = useMemo(() => 
  searchEngine.search(query), [query]
);

const handleSelect = useCallback((product) => {
  // Callback estável
}, [onSelectionChange]);
```

#### Cache de Resultados
```tsx
// Cache interno no FuzzySearchEngine
queryCache.set(normalizedQuery, results);
```

#### Virtualização (Futuro)
- Lista virtualizada para 1000+ resultados
- Lazy loading de dados
- Scroll infinito

## 📊 Métricas de Performance

### Benchmarks Esperados
- **Latência de Busca**: < 100ms
- **Uso de Memória**: < 50MB
- **Taxa de Cache Hit**: > 80%
- **Bundle Size Impact**: < 200KB

### Monitoramento
```tsx
// Log de performance (desenvolvimento)
console.time('search-execution');
const results = searchEngine.search(query);
console.timeEnd('search-execution');
```

## 🔮 Roadmap

### Próximas Funcionalidades
- [ ] Machine learning para relevância
- [ ] Histórico de buscas
- [ ] Busca por voz
- [ ] Offline search capability
- [ ] Busca por imagem/câmera
- [ ] Filtros avançados
- [ ] Analytics de busca

### Melhorias Planejadas
- [ ] Web Workers para busca pesada
- [ ] IndexedDB para cache persistente
- [ ] Service Worker para offline
- [ ] Progressive Web App support

## 📝 Contribuição

### Estrutura do Código
```
src/
├── components/
│   ├── SearchWithChips.tsx      # Componente principal
│   ├── SearchDropdown.tsx       # Dropdown de resultados
│   ├── SearchResultItem.tsx     # Item de resultado
│   └── ProductChip.tsx          # Chip do produto
├── hooks/
│   ├── useAdvancedSearch.ts     # Hook principal de busca
│   ├── useKeyboardNavigation.ts # Hook de navegação
│   └── useDebounce.ts           # Hook de debouncing
├── utils/
│   └── fuzzySearch.ts           # Engine de busca fuzzy
└── data/
    └── products.ts              # Interface e dados de produtos
```

### Guidelines
1. Manter compatibilidade com Material Design 3
2. Preservar total acessibilidade
3. Otimizar performance sempre
4. Documentar todas as mudanças
5. Incluir testes para novas funcionalidades

---

**Desenvolvido com foco em qualidade, performance e acessibilidade para React Native Paper**