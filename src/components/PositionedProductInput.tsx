import React, { useState, useRef, useEffect } from 'react';
import { View, ViewStyle, LayoutChangeEvent, StyleSheet } from 'react-native';
import { TextInput } from 'react-native-paper';
import ProductInputReplacement from './ProductInputReplacement';
import { Product } from '../data/products';

interface PositionedProductInputProps {
  products: Product[];
  selectedProduct: Product | null;
  onSelectionChange: (product: Product | null) => void;
  
  // Props para demonstrar substituição de input existente
  showOriginalInput?: boolean;
  originalInputStyle?: ViewStyle;
  label?: string;
  placeholder?: string;
}

const PositionedProductInput: React.FC<PositionedProductInputProps> = ({
  products,
  selectedProduct,
  onSelectionChange,
  showOriginalInput = true,
  originalInputStyle,
  label = "Campo Original",
  placeholder = "Este é um input que será substituído",
}) => {
  const [inputLayout, setInputLayout] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  
  const [showReplacement, setShowReplacement] = useState(false);
  const originalInputRef = useRef<View>(null);

  // Função para medir o input original
  const measureOriginalInput = () => {
    if (originalInputRef.current) {
      originalInputRef.current.measure((x, y, width, height, pageX, pageY) => {
        setInputLayout({
          x: pageX,
          y: pageY,
          width,
          height,
        });
      });
    }
  };

  // Effect para medir o input após renderização
  useEffect(() => {
    if (showOriginalInput) {
      // Delay para garantir que o layout foi calculado
      setTimeout(measureOriginalInput, 100);
    }
  }, [showOriginalInput]);

  // Função para alternar entre input original e substituição
  const toggleReplacement = () => {
    if (!showReplacement) {
      measureOriginalInput();
    }
    setShowReplacement(!showReplacement);
  };

  return (
    <View style={styles.container}>
      {/* Input Original (oculto quando substituído) */}
      {showOriginalInput && !showReplacement && (
        <View
          ref={originalInputRef}
          onLayout={measureOriginalInput}
        >
          <TextInput
            label={label}
            placeholder={placeholder}
            mode="outlined"
            style={[styles.originalInput, originalInputStyle]}
            onFocus={toggleReplacement}
          />
        </View>
      )}

      {/* Espaço reservado quando substituído (mantém layout) */}
      {showOriginalInput && showReplacement && (
        <View style={[styles.placeholder, { 
          width: inputLayout.width, 
          height: inputLayout.height 
        }]} />
      )}

      {/* Componente de Substituição Posicionado Absolutamente */}
      {showReplacement && inputLayout.width > 0 && (
        <ProductInputReplacement
          products={products}
          selectedProduct={selectedProduct}
          onSelectionChange={onSelectionChange}
          position="absolute"
          top={inputLayout.y}
          left={inputLayout.x}
          width={inputLayout.width}
          height={inputLayout.height}
          zIndex={1000}
          maintainExactDimensions={true}
          label="Buscar Produto (Substituição)"
          placeholder="Digite nome, descrição ou EAN..."
        />
      )}

      {/* Componente de Substituição Simples (quando não há input original) */}
      {!showOriginalInput && (
        <ProductInputReplacement
          products={products}
          selectedProduct={selectedProduct}
          onSelectionChange={onSelectionChange}
          label="Buscar Produto"
          placeholder="Digite nome, descrição ou EAN..."
          containerStyle={styles.simpleReplacement}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  originalInput: {
    marginVertical: 8,
  },
  placeholder: {
    marginVertical: 8,
  },
  simpleReplacement: {
    marginVertical: 8,
  },
});

export default PositionedProductInput;