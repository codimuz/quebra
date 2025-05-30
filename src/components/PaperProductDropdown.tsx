import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, TextInput as RNTextInput, Animated } from 'react-native';
import {
  TextInput,
  Chip,
  Portal,
  Text,
  TouchableRipple,
  useTheme,
} from 'react-native-paper';
import { Product } from '../data/products';

interface PaperProductDropdownProps {
  products: Product[];
  selectedProduct: Product | null;
  onSelectionChange: (product: Product | null) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
}

interface InputLayout {
  width: number;
  height: number;
  x: number;
  y: number;
}

const PaperProductDropdown: React.FC<PaperProductDropdownProps> = ({
  products,
  selectedProduct,
  onSelectionChange,
  placeholder = "Digite nome, descrição ou EAN...",
  label = "Buscar Produto",
  disabled = false,
}) => {
  const theme = useTheme();
  const [searchText, setSearchText] = useState('');
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [inputLayout, setInputLayout] = useState<InputLayout>({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  });
  
  const containerRef = useRef<View>(null);
  const textInputRef = useRef<any>(null);
  const inputOpacity = useRef(new Animated.Value(1)).current;
  const inputHeight = useRef(new Animated.Value(1)).current;

  // Efeito para animar o campo de busca baseado na seleção
  useEffect(() => {
    const duration = 300;
    
    if (selectedProduct) {
      // Ocultar campo de busca com animação suave
      Animated.parallel([
        Animated.timing(inputOpacity, {
          toValue: 0,
          duration,
          useNativeDriver: false,
        }),
        Animated.timing(inputHeight, {
          toValue: 0,
          duration,
          useNativeDriver: false,
        }),
      ]).start();
      
      // Limpar texto de busca quando produto é selecionado
      setSearchText('');
      setIsDropdownVisible(false);
    } else {
      // Exibir campo de busca com animação suave
      Animated.parallel([
        Animated.timing(inputOpacity, {
          toValue: 1,
          duration,
          useNativeDriver: false,
        }),
        Animated.timing(inputHeight, {
          toValue: 1,
          duration,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [selectedProduct, inputOpacity, inputHeight]);

  // Função de busca inteligente
  const filteredProducts = useMemo(() => {
    if (!searchText.trim()) return [];
    
    const query = searchText.toLowerCase().trim();
    
    return products.filter(product => {
      // 1. Busca por nome/descrição (combinados com hífen)
      const nameDescCombined = `${product.nome} - ${product.descricao}`.toLowerCase();
      const nameDescMatch = nameDescCombined.includes(query);
      
      // 2. Busca individual por nome
      const nameMatch = product.nome?.toLowerCase().includes(query);
      
      // 3. Busca individual por descrição
      const descMatch = product.descricao?.toLowerCase().includes(query);
      
      // 4. Busca exata por EAN completo
      const exactEanMatch = product.codigoCurtoean === searchText;
      
      // 5. Correspondência inteligente EAN curto (preenchimento com zeros)
      const shortEanMatch = product.codigoCurtoean && 
        /^\d+$/.test(searchText) &&
        product.codigoCurtoean === searchText.padStart(
          product.codigoCurtoean.length, '0'
        );
      
      // 6. Busca por código do produto
      const codeMatch = product.codigoProduto?.includes(searchText);
      
      return nameDescMatch || nameMatch || descMatch || exactEanMatch || shortEanMatch || codeMatch;
    });
  }, [searchText, products]);

  // Auto-seleção para EAN exato
  useEffect(() => {
    if (filteredProducts.length === 1 && /^\d+$/.test(searchText)) {
      const exactMatch = filteredProducts[0];
      const paddedSearch = searchText.padStart(exactMatch.codigoCurtoean?.length || 0, '0');
      
      if (exactMatch.codigoCurtoean === searchText || 
          exactMatch.codigoCurtoean === paddedSearch) {
        handleProductSelect(exactMatch);
      }
    }
  }, [filteredProducts, searchText]);

  // Medição do campo de entrada
  const measureInput = () => {
    if (containerRef.current) {
      containerRef.current.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
        setInputLayout({ width, height, x: pageX, y: pageY });
      });
    }
  };

  // Handler de seleção de produto
  const handleProductSelect = (product: Product) => {
    onSelectionChange(product);
    setSearchText('');
    setIsDropdownVisible(false);
  };

  // Handler de remoção de seleção
  const handleChipRemove = () => {
    onSelectionChange(null);
    setSearchText('');
    setIsDropdownVisible(false);
    
    // Focar no campo de busca após a animação de exibição
    setTimeout(() => {
      if (textInputRef.current && textInputRef.current.focus) {
        textInputRef.current.focus();
      }
    }, 350); // Delay ligeiramente maior que a duração da animação (300ms)
  };

  // Estilo do dropdown posicionado
  const dropdownStyle = {
    position: 'absolute' as const,
    top: inputLayout.y + inputLayout.height + 4,
    left: inputLayout.x,
    width: inputLayout.width,
    zIndex: 9999,
    elevation: 8, // Android
    shadowOffset: { width: 0, height: 2 }, // iOS
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    backgroundColor: theme.colors.surface,
    borderRadius: 4,
    maxHeight: 300,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  };

  return (
    <View style={styles.container}>
      {/* Chip de produto selecionado com banner MD3 */}
      {selectedProduct && (
        <View style={[
          styles.selectedProductBanner,
          {
            backgroundColor: theme.colors.surfaceVariant,
            borderColor: theme.colors.outline,
          }
        ]}>
          <Chip
            mode="outlined"
            onClose={handleChipRemove}
            style={styles.selectedChip}
          >
            {selectedProduct.codigoProduto} | {selectedProduct.descricao}
          </Chip>
          <Text
            variant="bodySmall"
            style={[
              styles.selectedProductInfo,
              { color: theme.colors.onSurfaceVariant }
            ]}
          >
            {selectedProduct.descricao} • R$ {selectedProduct.preco?.toFixed(2) || '0.00'} ({selectedProduct.unidade})
          </Text>
        </View>
      )}

      {/* Campo de entrada de busca com animação */}
      <Animated.View
        ref={containerRef}
        onLayout={measureInput}
        style={{
          opacity: inputOpacity,
          transform: [
            {
              scaleY: inputHeight,
            },
          ],
        }}
      >
      <TextInput
        ref={textInputRef}
        label={label}
        placeholder={selectedProduct ? '' : placeholder}
        value={searchText}
        onChangeText={setSearchText}
        onFocus={() => {
          if (!selectedProduct) {
            setTimeout(measureInput, 100);
            setIsDropdownVisible(true);
          }
        }}
        onBlur={() => {
          // Delay para permitir clique nos itens do dropdown
          setTimeout(() => setIsDropdownVisible(false), 150);
        }}
        returnKeyType="done"
        onSubmitEditing={() => {
          const numericSearch = searchText.trim();
          if (/^\d+$/.test(numericSearch)) {
            // Busca por código curto EAN ou código do produto completo
            const exactMatch = products.find(p => 
              p.codigoCurtoean === numericSearch || 
              p.codigoProduto === numericSearch ||
              p.codigoProduto === numericSearch.padStart(13, '0') // Para produtos com código EAN completo
            );
            
            if (exactMatch) {
              handleProductSelect(exactMatch);
            } else {
              // Feedback visual quando nenhum produto é encontrado
              textInputRef.current?.setNativeProps({
                style: { borderColor: theme.colors.error }
              });
              setTimeout(() => {
                textInputRef.current?.setNativeProps({
                  style: { borderColor: theme.colors.outline }
                });
              }, 1000);
            }
          }
        }}
        onKeyPress={({ nativeEvent }) => {
          if (nativeEvent.key === 'Enter') {
            const numericSearch = searchText.trim();
            if (/^\d+$/.test(numericSearch)) {
              // Busca por código curto EAN ou código do produto completo
              const exactMatch = products.find(p => 
                p.codigoCurtoean === numericSearch || 
                p.codigoProduto === numericSearch ||
                p.codigoProduto === numericSearch.padStart(13, '0') // Para produtos com código EAN completo
              );
              
              if (exactMatch) {
                handleProductSelect(exactMatch);
              } else {
                // Feedback visual quando nenhum produto é encontrado
                textInputRef.current?.setNativeProps({
                  style: { borderColor: theme.colors.error }
                });
                setTimeout(() => {
                  textInputRef.current?.setNativeProps({
                    style: { borderColor: theme.colors.outline }
                  });
                }, 1000);
              }
            }
          }
        }}
          mode="outlined"
          disabled={disabled || !!selectedProduct}
          style={styles.textInput}
        />
      </Animated.View>

      {/* Dropdown com Portal para z-index máximo */}
      <Portal>
        {isDropdownVisible && filteredProducts.length > 0 && inputLayout.width > 0 && (
          <View style={[styles.dropdownContainer, dropdownStyle]}>
            <ScrollView 
              style={styles.scrollView} 
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={true}
            >
              {filteredProducts.map((product, index) => (
                <TouchableRipple
                  key={`${product.codigoProduto}-${index}`}
                  onPress={() => handleProductSelect(product)}
                  style={styles.productItem}
                  rippleColor="rgba(0, 0, 0, 0.12)"
                >
                  <View style={styles.productContent}>
                    <Text variant="bodyLarge" style={styles.productName}>
                      {product.nome}
                    </Text>
                    <Text variant="bodySmall" style={[styles.productDescription, { color: theme.colors.onSurfaceVariant }]}>
                      {product.descricao} - R$ {product.preco?.toFixed(2) || '0.00'} ({product.unidade})
                    </Text>
                    <Text variant="bodySmall" style={[styles.productEan, { color: theme.colors.onSurfaceVariant }]}>
                      EAN: {product.codigoCurtoean} | Código: {product.codigoProduto}
                    </Text>
                  </View>
                </TouchableRipple>
              ))}
            </ScrollView>
          </View>
        )}
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    position: 'relative',
  },
  textInput: {
    marginBottom: 0,
  },
  selectedProductBanner: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
    elevation: 2,
  },
  selectedChip: {
    marginBottom: 6,
    alignSelf: 'flex-start',
    borderWidth: 0,
    paddingVertical: 0,
    paddingHorizontal: 8,
    borderRadius: 16,
    padding: 8,
  },
  selectedProductInfo: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 16,
  },
  dropdownContainer: {
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  scrollView: {
    maxHeight: 300,
    borderRadius: 8,
  },
  productItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  productContent: {
    flexDirection: 'column',
  },
  productName: {
    fontWeight: '400',
    marginBottom: 2,
  },
  productDescription: {
    marginBottom: 2,
  },
  productEan: {
    fontSize: 12,
  },
});

export default PaperProductDropdown;
