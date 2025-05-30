import React, { useState, useRef, useEffect } from 'react';
import { View, ViewStyle, LayoutChangeEvent, DimensionValue } from 'react-native';
import PaperProductDropdown from './PaperProductDropdown';
import { Product } from '../data/products';

interface ProductInputReplacementProps {
  products: Product[];
  selectedProduct: Product | null;
  onSelectionChange: (product: Product | null) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  
  // Props para substituir um input existente
  replaceInputStyle?: ViewStyle;
  containerStyle?: ViewStyle;
  maintainExactDimensions?: boolean;
  
  // Props para posicionamento customizado
  position?: 'absolute' | 'relative';
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  width?: DimensionValue;
  height?: DimensionValue;
  zIndex?: number;
}

const ProductInputReplacement: React.FC<ProductInputReplacementProps> = ({
  products,
  selectedProduct,
  onSelectionChange,
  placeholder = "Digite nome, descrição ou EAN...",
  label = "Buscar Produto",
  disabled = false,
  replaceInputStyle,
  containerStyle,
  maintainExactDimensions = false,
  position = 'relative',
  top,
  left,
  right,
  bottom,
  width,
  height,
  zIndex = 1000,
}) => {
  const [componentLayout, setComponentLayout] = useState({
    width: 0,
    height: 0,
  });

  const containerRef = useRef<View>(null);

  // Função para medir o layout do componente
  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setComponentLayout({ width, height });
  };

  // Estilo dinâmico baseado nas props de posicionamento
  const dynamicContainerStyle: ViewStyle = {
    position,
    ...(position === 'absolute' && {
      top,
      left,
      right,
      bottom,
      zIndex,
    }),
    ...(width && { width }),
    ...(height && { height }),
    ...containerStyle,
  };

  // Estilo para manter dimensões exatas se especificado
  const exactDimensionsStyle: ViewStyle = maintainExactDimensions
    ? {
        width: replaceInputStyle?.width || componentLayout.width || 'auto',
        height: replaceInputStyle?.height || componentLayout.height || 'auto',
        minWidth: replaceInputStyle?.minWidth,
        maxWidth: replaceInputStyle?.maxWidth,
        minHeight: replaceInputStyle?.minHeight,
        maxHeight: replaceInputStyle?.maxHeight,
      }
    : {};

  // Combinar todos os estilos
  const finalContainerStyle: ViewStyle = {
    ...dynamicContainerStyle,
    ...exactDimensionsStyle,
    ...replaceInputStyle,
  };

  return (
    <View
      ref={containerRef}
      style={finalContainerStyle}
      onLayout={onLayout}
    >
      <PaperProductDropdown
        products={products}
        selectedProduct={selectedProduct}
        onSelectionChange={onSelectionChange}
        placeholder={placeholder}
        label={label}
        disabled={disabled}
      />
    </View>
  );
};

export default ProductInputReplacement;