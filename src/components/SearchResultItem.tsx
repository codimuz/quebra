import React from 'react';
import { View, StyleSheet } from 'react-native';
import { List, Text, useTheme } from 'react-native-paper';
import { Product } from '../data/products';
import { MatchType } from '../utils/fuzzySearch';

interface SearchResultItemProps {
  product: Product;
  searchTerm: string;
  isActive: boolean;
  matchType: MatchType;
  onSelect: () => void;
  highlightRanges?: Array<{ start: number; end: number }>;
  testID?: string;
}

const SearchResultItem: React.FC<SearchResultItemProps> = ({
  product,
  searchTerm,
  isActive,
  matchType,
  onSelect,
  highlightRanges = [],
  testID
}) => {
  const theme = useTheme();

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const highlightText = (text: string, ranges: Array<{ start: number; end: number }>): React.ReactNode => {
    if (ranges.length === 0) {
      return text;
    }

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    // Sort ranges by start position
    const sortedRanges = [...ranges].sort((a, b) => a.start - b.start);

    sortedRanges.forEach((range, index) => {
      // Add text before highlight
      if (range.start > lastIndex) {
        parts.push(
          <Text key={`text-${index}`} style={styles.normalText}>
            {text.substring(lastIndex, range.start)}
          </Text>
        );
      }

      // Add highlighted text
      parts.push(
        <Text 
          key={`highlight-${index}`} 
          style={[
            styles.highlightText,
            { backgroundColor: theme.colors.primaryContainer }
          ]}
        >
          {text.substring(range.start, range.end)}
        </Text>
      );

      lastIndex = range.end;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(
        <Text key="text-end" style={styles.normalText}>
          {text.substring(lastIndex)}
        </Text>
      );
    }

    return <>{parts}</>;
  };

  const getMatchTypeLabel = (type: MatchType): string => {
    switch (type) {
      case MatchType.EAN_EXACT:
        return 'EAN';
      case MatchType.EAN_PARTIAL:
        return 'EAN';
      case MatchType.DESCRIPTION_EXACT:
        return 'Descrição';
      case MatchType.DESCRIPTION_FUZZY:
        return 'Similaridade';
      case MatchType.DESCRIPTION_SEMANTIC:
        return 'Relacionado';
      default:
        return '';
    }
  };

  const truncateDescription = (description: string, maxLength: number = 50): string => {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + '...';
  };

  const isEANMatch = matchType === MatchType.EAN_EXACT || matchType === MatchType.EAN_PARTIAL;

  return (
    <List.Item
      title={() => (
        <View style={styles.titleContainer}>
          <Text 
            style={[
              styles.description,
              isActive && { color: theme.colors.primary }
            ]}
            numberOfLines={2}
          >
            {highlightText(
              truncateDescription(product.description, 45),
              highlightRanges
            )}
          </Text>
          {isEANMatch && (
            <Text style={[styles.eanBadge, { color: theme.colors.primary }]}>
              EAN: {product.ean}
            </Text>
          )}
        </View>
      )}
      description={() => (
        <View style={styles.descriptionContainer}>
          <Text style={[styles.price, { color: theme.colors.onSurfaceVariant }]}>
            {formatPrice(product.price)}
          </Text>
          <Text style={[styles.matchType, { color: theme.colors.outline }]}>
            {getMatchTypeLabel(matchType)}
          </Text>
        </View>
      )}
      onPress={onSelect}
      style={[
        styles.listItem,
        isActive && {
          backgroundColor: theme.colors.surfaceVariant
        }
      ]}
      contentStyle={styles.listItemContent}
      testID={testID}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`${product.description}, ${formatPrice(product.price)}, ${getMatchTypeLabel(matchType)}`}
      accessibilityHint="Toque para selecionar este produto"
      accessibilityState={{ selected: isActive }}
    />
  );
};

const styles = StyleSheet.create({
  listItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 4,
    marginVertical: 2,
  },
  listItemContent: {
    paddingLeft: 0,
  },
  titleContainer: {
    flex: 1,
  },
  description: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    marginBottom: 4,
  },
  eanBadge: {
    fontSize: 11,
    fontWeight: '600',
    opacity: 0.8,
  },
  descriptionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  price: {
    fontSize: 13,
    fontWeight: '600',
  },
  matchType: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  normalText: {
    color: 'inherit',
  },
  highlightText: {
    fontWeight: '700',
    borderRadius: 2,
    paddingHorizontal: 2,
  },
});

export default React.memo(SearchResultItem);