import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Portal, Surface, Text, ActivityIndicator, useTheme } from 'react-native-paper';
import { SearchResult } from '../utils/fuzzySearch';
import SearchResultItem from './SearchResultItem';

interface SearchDropdownProps {
  visible: boolean;
  searchResults: SearchResult[];
  activeIndex: number;
  onProductSelect: (result: SearchResult) => void;
  searchTerm: string;
  isLoading: boolean;
  error: string | null;
  isEmpty: boolean;
  maxHeight?: number;
  width: number;
  position: { x: number; y: number; inputHeight?: number };
  keyboardHeight?: number;
  onDismiss: () => void;
  testID?: string;
}

const SearchDropdown: React.FC<SearchDropdownProps> = ({
  visible,
  searchResults,
  activeIndex,
  onProductSelect,
  searchTerm,
  isLoading,
  error,
  isEmpty,
  maxHeight = 300,
  width,
  position,
  keyboardHeight = 0,
  onDismiss,
  testID
}) => {
  const theme = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const itemHeightRef = useRef(72); // Approximate height of each item

  // Auto-scroll to active item
  useEffect(() => {
    if (visible && activeIndex >= 0 && scrollViewRef.current) {
      const offset = activeIndex * itemHeightRef.current;
      scrollViewRef.current.scrollTo({
        y: offset,
        animated: true
      });
    }
  }, [activeIndex, visible]);

  // Auto-dismiss when clicking outside (handled by Portal)
  useEffect(() => {
    if (!visible) return;

    const handleOutsideClick = () => {
      onDismiss();
    };

    // This would be handled by the parent component's touch handling
    return () => {
      // Cleanup if needed
    };
  }, [visible, onDismiss]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator 
            size="small" 
            color={theme.colors.primary}
            testID="search-loading"
          />
          <Text 
            style={[styles.statusText, { color: theme.colors.onSurfaceVariant }]}
            accessible
            accessibilityLiveRegion="polite"
          >
            Buscando produtos...
          </Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Text 
            style={[styles.errorText, { color: theme.colors.error }]}
            accessible
            accessibilityRole="alert"
          >
            {error}
          </Text>
        </View>
      );
    }

    if (isEmpty) {
      return (
        <View style={styles.centerContainer}>
          <Text 
            style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}
            accessible
            accessibilityLiveRegion="polite"
          >
            Nenhum produto encontrado para "{searchTerm}"
          </Text>
          <Text 
            style={[styles.emptyHint, { color: theme.colors.outline }]}
          >
            Tente usar termos diferentes ou o código EAN
          </Text>
        </View>
      );
    }

    if (searchResults.length === 0 && !searchTerm.trim()) {
      return (
        <View style={styles.centerContainer}>
          <Text 
            style={[styles.placeholderText, { color: theme.colors.onSurfaceVariant }]}
          >
            Digite para buscar produtos...
          </Text>
        </View>
      );
    }

    return (
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
      >
        <View 
          style={styles.resultsContainer}
          accessible={false}
        >
          {searchResults.map((result, index) => (
            <SearchResultItem
              key={`${result.product.ean}-${index}`}
              product={result.product}
              searchTerm={searchTerm}
              isActive={index === activeIndex}
              matchType={result.matchType}
              onSelect={() => onProductSelect(result)}
              highlightRanges={result.highlightRanges}
              testID={`search-result-${index}`}
            />
          ))}
        </View>
      </ScrollView>
    );
  };

  const getDropdownStyle = () => {
    const screenHeight = Dimensions.get('window').height;
    const screenWidth = Dimensions.get('window').width;
    
    // Ensure safe positioning values with better bounds checking
    const safeLeft = Math.max(8, Math.min(position.x || 0, screenWidth - width - 8));
    const safeWidth = Math.max(200, Math.min(width || 200, screenWidth - 16));
    
    // Enhanced positioning logic
    const inputHeight = position.inputHeight || 56;
    const topBuffer = 8; // Space above dropdown
    const bottomBuffer = 20 + keyboardHeight; // Space below dropdown + keyboard
    
    const availableHeightBelow = screenHeight - position.y - inputHeight - bottomBuffer;
    const availableHeightAbove = position.y - topBuffer;
    
    // Improved decision logic for above/below placement
    const shouldShowAbove = availableHeightBelow < 120 && availableHeightAbove > 150;
    
    let finalTop: number;
    let finalMaxHeight: number;
    
    if (shouldShowAbove) {
      finalMaxHeight = Math.min(maxHeight, availableHeightAbove);
      finalTop = position.y - finalMaxHeight - topBuffer;
    } else {
      finalMaxHeight = Math.min(maxHeight, Math.max(120, availableHeightBelow));
      finalTop = position.y + inputHeight;
    }

    // Ensure dropdown doesn't go off-screen
    finalTop = Math.max(topBuffer, Math.min(finalTop, screenHeight - finalMaxHeight - bottomBuffer));

    return {
      position: 'absolute' as const,
      left: safeLeft,
      top: finalTop,
      width: safeWidth,
      maxHeight: finalMaxHeight,
      minHeight: Math.min(80, finalMaxHeight), // Ensure minimum usable height
      zIndex: 1000,
      // Enhanced shadow and border for better visual separation
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 8,
    };
  };

  if (!visible) {
    return null;
  }

  return (
    <Portal>
      <View
        style={styles.overlay}
        testID="search-dropdown-overlay"
        accessible={false}
      >
        <Surface
          style={[
            styles.dropdown,
            getDropdownStyle(),
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.outline,
            }
          ]}
          elevation={4}
          testID={testID}
          accessible
          accessibilityRole="menu"
          accessibilityLabel={`Lista de produtos encontrados, ${searchResults.length} resultados`}
        >
          {renderContent()}
        </Surface>
      </View>
    </Portal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    backgroundColor: 'transparent', // Allow touch through when not interacting
  },
  dropdown: {
    borderWidth: 1,
    borderRadius: 12, // More modern rounded corners
    overflow: 'hidden',
    // Enhanced visual styling
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  scrollView: {
    flex: 1,
    // ScrollView properties are set directly on the component
  },
  resultsContainer: {
    paddingVertical: 6, // Better spacing for results
  },
  centerContainer: {
    padding: 24, // More generous padding
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100, // Increased min height for better UX
  },
  statusText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20, // Better line height
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 20,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 6, // Better spacing
    lineHeight: 20,
  },
  emptyHint: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 16,
  },
  placeholderText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 20,
  },
});

export default React.memo(SearchDropdown);