import React from 'react';
import { Chip } from 'react-native-paper';
import { Product } from '../data/products';

interface SimpleProductChipProps {
  product: Product;
  onRemove: () => void;
  maxLength?: number;
  showPrice?: boolean;
  variant?: 'outlined' | 'flat';
  testID?: string;
}

const SimpleProductChip: React.FC<SimpleProductChipProps> = ({
  product,
  onRemove,
  maxLength = 25,
  showPrice = false,
  variant = 'flat',
  testID
}) => {
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const truncateText = (text: string, maxLen: number): string => {
    if (text.length <= maxLen) return text;
    return text.substring(0, maxLen) + '...';
  };

  const getChipText = (): string => {
    const description = truncateText(product.description, maxLength);
    return showPrice ? `${description} - ${formatPrice(product.price)}` : description;
  };

  const getAccessibilityLabel = (): string => {
    return `Produto selecionado: ${product.description}, ${formatPrice(product.price)}. Toque para remover.`;
  };

  return (
    <Chip
      mode={variant}
      onClose={onRemove}
      closeIcon="close"
      testID={testID}
      accessible
      accessibilityRole="button"
      accessibilityLabel={getAccessibilityLabel()}
      accessibilityHint="Produto selecionado, toque para remover"
    >
      {getChipText()}
    </Chip>
  );
};

export default React.memo(SimpleProductChip);