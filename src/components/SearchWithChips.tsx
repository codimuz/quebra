import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Chip, Menu, useTheme, Text } from 'react-native-paper';
import { Product } from '../data/products';

interface SearchWithChipsProps {
  products: Product[];
  onSelectionChange: (selectedProducts: Product[]) => void;
  label?: string;
  placeholder?: string;
}

const SearchWithChips: React.FC<SearchWithChipsProps> = ({
  products,
  onSelectionChange,
  label = 'Buscar Produtos',
  placeholder = 'Digite EAN ou descrição do produto...',
}) => {
  const theme = useTheme();
  const [searchText, setSearchText] = React.useState('');
  const [selectedProducts, setSelectedProducts] = React.useState<Product[]>([]);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [filteredProducts, setFilteredProducts] = React.useState<Product[]>([]);
  const inputRef = React.useRef<any>(null);

  // Função de busca com lógica específica para produtos
  const searchProducts = React.useCallback((query: string): Product[] => {
    if (!query.trim()) return [];

    const trimmedQuery = query.trim().toLowerCase();
    const results: Product[] = [];
    const exactEanMatches: Product[] = [];
    const partialEanMatches: Product[] = [];
    const descriptionMatches: Product[] = [];

    // Filtra produtos já selecionados
    const availableProducts = products.filter(
      product => !selectedProducts.some(selected => selected.ean === product.ean)
    );

    availableProducts.forEach(product => {
      const eanLower = product.ean.toLowerCase();
      const descriptionLower = product.description.toLowerCase();

      // Correspondência exata no EAN
      if (eanLower === trimmedQuery) {
        exactEanMatches.push(product);
      }
      // Correspondência parcial no EAN (começa com)
      else if (eanLower.startsWith(trimmedQuery)) {
        partialEanMatches.push(product);
      }
      // Correspondência na descrição
      else if (descriptionLower.includes(trimmedQuery)) {
        descriptionMatches.push(product);
      }
    });

    // Ordena os resultados por prioridade: EAN exato -> EAN parcial -> Descrição
    results.push(...exactEanMatches);
    results.push(...partialEanMatches);
    results.push(...descriptionMatches);

    // Limita a 10 resultados para performance
    return results.slice(0, 10);
  }, [products, selectedProducts]);

  const handleTextChange = (text: string) => {
    setSearchText(text);
    
    if (text.trim().length >= 2) {
      const results = searchProducts(text);
      setFilteredProducts(results);
      setShowDropdown(results.length > 0);
    } else {
      setFilteredProducts([]);
      setShowDropdown(false);
    }
  };

  const handleProductSelect = (product: Product) => {
    if (!selectedProducts.some(selected => selected.ean === product.ean)) {
      const newSelectedProducts = [...selectedProducts, product];
      setSelectedProducts(newSelectedProducts);
      onSelectionChange(newSelectedProducts);
    }
    setSearchText('');
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const handleChipRemove = (productEan: string) => {
    const newSelectedProducts = selectedProducts.filter(product => product.ean !== productEan);
    setSelectedProducts(newSelectedProducts);
    onSelectionChange(newSelectedProducts);
  };

  const handleFocus = () => {
    if (searchText.trim().length >= 2 && filteredProducts.length > 0) {
      setShowDropdown(true);
    } else if (searchText.trim().length === 0) {
      // Mostra alguns produtos como exemplo quando o campo está vazio
      const availableProducts = products.filter(
        product => !selectedProducts.some(selected => selected.ean === product.ean)
      ).slice(0, 6);
      setFilteredProducts(availableProducts);
      setShowDropdown(availableProducts.length > 0);
    }
  };

  const handleBlur = () => {
    // Delay para permitir que o usuário clique nos itens do menu
    setTimeout(() => setShowDropdown(false), 300);
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const truncateDescription = (description: string, maxLength: number = 40): string => {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + '...';
  };

  const renderChips = () => (
    <View style={styles.chipsContainer}>
      {selectedProducts.map(product => (
        <Chip
          key={product.ean}
          onClose={() => handleChipRemove(product.ean)}
          style={styles.chip}
        >
          <Text style={styles.chipText}>
            {truncateDescription(product.description, 25)}
          </Text>
          <Text style={styles.chipEan}>
            {' '}({product.ean})
          </Text>
        </Chip>
      ))}
    </View>
  );

  const renderMenuContent = () => {
    if (searchText.trim().length === 0 && filteredProducts.length > 0) {
      // Mostra exemplos quando o campo está vazio
      return (
        <>
          <Menu.Item
            disabled
            title="Exemplos de produtos:"
            titleStyle={styles.headerText}
          />
          {filteredProducts.map(product => (
            <Menu.Item
              key={product.ean}
              onPress={() => handleProductSelect(product)}
              title={
                <View style={styles.menuItemContent}>
                  <Text style={styles.productDescription}>
                    {truncateDescription(product.description, 35)}
                  </Text>
                  <View style={styles.productInfo}>
                    <Text style={styles.productEan}>EAN: {product.ean}</Text>
                    <Text style={styles.productPrice}>{formatPrice(product.price)}</Text>
                  </View>
                </View>
              }
              titleStyle={styles.exampleText}
            />
          ))}
        </>
      );
    } else if (searchText.trim().length >= 2) {
      // Mostra resultados da busca
      if (filteredProducts.length > 0) {
        return filteredProducts.map(product => (
          <Menu.Item
            key={product.ean}
            onPress={() => handleProductSelect(product)}
            title={
              <View style={styles.menuItemContent}>
                <Text style={styles.productDescription}>
                  {truncateDescription(product.description, 35)}
                </Text>
                <View style={styles.productInfo}>
                  <Text style={styles.productEan}>EAN: {product.ean}</Text>
                  <Text style={styles.productPrice}>{formatPrice(product.price)}</Text>
                </View>
              </View>
            }
          />
        ));
      } else {
        return (
          <Menu.Item
            disabled
            title="Nenhum produto encontrado para sua busca"
          />
        );
      }
    } else if (searchText.trim().length === 1) {
      return (
        <Menu.Item
          disabled
          title="Digite pelo menos 2 caracteres para buscar"
        />
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      {renderChips()}
      <View>
        <TextInput
          ref={inputRef}
          mode="outlined"
          label={label}
          placeholder={placeholder}
          value={searchText}
          onChangeText={handleTextChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        
        <Menu
          visible={showDropdown}
          onDismiss={() => setShowDropdown(false)}
          anchor={
            <View style={styles.anchorView} />
          }
          contentStyle={styles.menuContent}
        >
          {renderMenuContent()}
        </Menu>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    marginRight: 4,
    marginBottom: 4,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  chipEan: {
    fontSize: 10,
    opacity: 0.7,
  },
  anchorView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 56,
  },
  menuContent: {
    marginTop: 8,
    maxHeight: 300,
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 12,
    opacity: 0.7,
  },
  exampleText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  menuItemContent: {
    flex: 1,
  },
  productDescription: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  productInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productEan: {
    fontSize: 11,
    opacity: 0.7,
    flex: 1,
  },
  productPrice: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
});

export default SearchWithChips;
