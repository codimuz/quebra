import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Chip, useTheme } from 'react-native-paper';
import { Product } from '../data/products';
import { ChipState, ChipStateProps, getAriaStates } from '../types/chipStates';
import { getChipStyles, getStateIndicatorStyles } from '../styles/chipThemes';

interface ProductChipProps extends Partial<ChipStateProps> {
  product: Product;
  onRemove: () => void;
  maxLength?: number;
  showPrice?: boolean;
  variant?: 'outlined' | 'flat';
  testID?: string;
  chipState?: ChipState;
}

const ProductChip: React.FC<ProductChipProps> = ({
  product,
  onRemove,
  maxLength = 25,
  showPrice = false,
  variant = 'flat',
  testID,
  chipState = 'selected',
  showStateIndicator = false,
  animationDuration = 300
}) => {
  const theme = useTheme();
  
  // Obter estilos baseados no estado
  const chipStyles = getChipStyles(chipState, theme, variant);
  const indicatorStyles = getStateIndicatorStyles(chipState, theme);
  
  // Obter estados ARIA
  const ariaStates = getAriaStates(chipState);

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
    const stateDescription = (() => {
      switch (chipState) {
        case 'active':
          return 'ativo';
        case 'persistent':
          return 'selecionado permanentemente';
        case 'selected':
          return 'selecionado';
        default:
          return '';
      }
    })();
    
    const baseLabel = `Produto ${stateDescription}: ${product.description}, ${formatPrice(product.price)}`;
    return `${baseLabel}. Toque para remover.`;
  };

  const getAccessibilityHint = (): string => {
    switch (chipState) {
      case 'persistent':
        return 'Produto mantido selecionado mesmo sem foco. Toque para remover.';
      case 'active':
        return 'Produto ativo no campo de busca. Toque para remover.';
      default:
        return 'Produto selecionado, toque para remover';
    }
  };

  return (
    <View style={styles.container}>
      <Chip
        mode={variant}
        onClose={onRemove}
        closeIcon="close"
        style={chipStyles.chip}
        textStyle={chipStyles.chipText}
        testID={testID}
        accessible
        accessibilityRole="button"
        accessibilityLabel={getAccessibilityLabel()}
        accessibilityHint={getAccessibilityHint()}
        {...ariaStates}
      >
        {getChipText()}
      </Chip>
      
      {/* Indicador de estado opcional */}
      {showStateIndicator && chipState !== 'none' && (
        <View
          style={indicatorStyles.indicator}
          accessible={false}
          testID={`${testID}-state-indicator`}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  // Estilos base foram movidos para chipThemes.ts
  // Mantendo apenas estilos específicos do componente
});

export default React.memo(ProductChip);