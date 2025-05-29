import React, { useCallback, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, TextInputProps } from 'react-native-paper';
import { Product } from '../data/products';
import { SearchResult } from '../utils/fuzzySearch';
import { useAdvancedSearch } from '../hooks/useAdvancedSearch';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';
import { useFocusAwareState } from '../hooks/useFocusAwareState';
import SearchDropdown from './SearchDropdown';
import SimpleProductChip from './SimpleProductChip';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

export interface FocusAwareChipContainerProps extends Omit<TextInputProps, 'value' | 'onChangeText' | 'onFocus' | 'onBlur' | 'onSelectionChange'> {
  products: Product[];
  onSelectionChange: (product: Product | null) => void;
  maxResults?: number;
  debounceMs?: number;
  fuzzyThreshold?: number;
  allowClear?: boolean;
  autoFocus?: boolean;
}

const FocusAwareChipContainer: React.FC<FocusAwareChipContainerProps> = ({
  products,
  onSelectionChange,
  label = 'Buscar Produtos',
  placeholder = 'Digite EAN ou descrição do produto...',
  maxResults = 10,
  debounceMs = 300,
  fuzzyThreshold = 0.6,
  disabled = false,
  error,
  allowClear = true,
  autoFocus = false,
  testID = 'focus-aware-chip-container',
  ...otherProps
}) => {
  const inputRef = useRef<any>(null);
  const containerRef = useRef<View>(null);
  
  // Estado local
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [inputPosition, setInputPosition] = useState({ x: 0, y: 100, width: 300, height: 56 });
  const [containerLayout, setContainerLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });

  // Hook de foco que considera chips ativos
  const {
    isInputFocused,
    isContainerFocused,
    handleInputFocus,
    handleInputBlur
  } = useFocusAwareState(Boolean(selectedProduct));

  // Advanced search hook
  const {
    searchResults,
    isLoading,
    error: searchError,
    searchQuery,
    setSearchQuery,
    clearSearch,
    hasResults,
    isEmpty
  } = useAdvancedSearch({
    products,
    debounceMs,
    maxResults,
    fuzzyThreshold
  });

  // Keyboard navigation hook
  const {
    activeIndex,
    setActiveIndex,
    handleKeyDown,
    resetNavigation
  } = useKeyboardNavigation({
    itemCount: searchResults.length,
    onSelect: handleItemSelect,
    onEscape: () => {
      setShowDropdown(false);
      clearSearch();
      inputRef.current?.blur();
    },
    onEnter: handleItemSelect,
    loop: true,
    disabled: disabled || !showDropdown
  });

  // Responsive layout hook
  const {
    keyboardHeight,
    dropdownMaxHeight,
    getDropdownPosition
  } = useResponsiveLayout({
    containerWidth: containerLayout.width,
    inputHeight: inputPosition.height
  });

  const displayError = searchError || error;

  // Medição da posição do input
  const measureInput = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.measureInWindow((x, y, width, height) => {
        const safeX = isNaN(x) ? 0 : Math.max(0, x);
        const safeY = isNaN(y) ? 100 : Math.max(0, y);
        const safeWidth = isNaN(width) ? 300 : Math.max(200, width);
        const safeHeight = isNaN(height) ? 56 : Math.max(40, height);
        
        setInputPosition({
          x: safeX,
          y: safeY + safeHeight,
          width: safeWidth,
          height: safeHeight
        });
      });
    }
  }, []);

  // Handle container layout
  const handleContainerLayout = useCallback((event: any) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    setContainerLayout({ x, y, width, height });
    setTimeout(measureInput, 10);
  }, [measureInput]);

  // Handle text changes
  const handleTextChange = useCallback((text: string) => {
    setSearchQuery(text);
    
    if (text.trim().length > 0 && !showDropdown) {
      setShowDropdown(true);
      measureInput();
    }
  }, [setSearchQuery, showDropdown, measureInput]);

  // Handle focus - usa o comportamento nativo mas considera chips
  const onFocus = useCallback(() => {
    handleInputFocus();
    measureInput();
    
    if (searchQuery.trim().length > 0 || hasResults) {
      setShowDropdown(true);
    }
  }, [handleInputFocus, searchQuery, hasResults, measureInput]);

  // Handle blur - mantém foco visual se há chips
  const onBlur = useCallback(() => {
    handleInputBlur();
    
    setTimeout(() => {
      setShowDropdown(false);
      resetNavigation();
    }, 200);
  }, [handleInputBlur, resetNavigation]);

  // Handle item selection
  function handleItemSelect(index?: number) {
    const targetIndex = index !== undefined ? index : activeIndex;
    
    if (targetIndex >= 0 && targetIndex < searchResults.length) {
      const selectedResult = searchResults[targetIndex];
      handleProductSelect(selectedResult);
    }
  }

  // Handle product selection
  const handleProductSelect = useCallback((result: SearchResult) => {
    const product = result.product;
    setSelectedProduct(product);
    onSelectionChange(product);
    clearSearch();
    setShowDropdown(false);
    resetNavigation();
    
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, [onSelectionChange, clearSearch, resetNavigation]);

  // Handle chip removal
  const handleChipRemove = useCallback(() => {
    setSelectedProduct(null);
    onSelectionChange(null);
    inputRef.current?.focus();
  }, [onSelectionChange]);

  // Handle dropdown dismiss
  const handleDropdownDismiss = useCallback(() => {
    setShowDropdown(false);
    resetNavigation();
  }, [resetNavigation]);

  // Handle key events
  const handleKeyPress = useCallback((event: any) => {
    const handled = handleKeyDown(event);
    
    if (!handled) {
      switch (event.nativeEvent.key) {
        case 'Backspace':
          if (!searchQuery.trim() && selectedProduct && allowClear) {
            handleChipRemove();
          }
          break;
      }
    }
  }, [handleKeyDown, searchQuery, selectedProduct, allowClear, handleChipRemove]);

  // Auto-focus if requested
  React.useEffect(() => {
    if (autoFocus && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [autoFocus]);

  // Show dropdown when results are available
  React.useEffect(() => {
    if (isInputFocused && (hasResults || isEmpty || displayError) && searchQuery.trim().length > 0) {
      if (!showDropdown) {
        setShowDropdown(true);
        measureInput();
      }
    }
  }, [hasResults, isEmpty, displayError, searchQuery, isInputFocused, showDropdown, measureInput]);

  // Calcular padding do conteúdo baseado na presença do chip
  const getContentStyle = () => {
    if (!selectedProduct) return undefined;
    
    return {
      paddingLeft: 100, // Espaço para o chip
      paddingRight: 48,  // Espaço para ícones
    };
  };

  return (
    <View
      style={styles.container}
      ref={containerRef}
      onLayout={handleContainerLayout}
    >
      {/* TextInput com foco controlado pelo Paper */}
      <TextInput
        ref={inputRef}
        mode="outlined"
        label={selectedProduct && !isInputFocused ? "" : label}
        placeholder={selectedProduct ? "Digite para buscar outro produto..." : placeholder}
        value={searchQuery}
        onChangeText={handleTextChange}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyPress={handleKeyPress}
        disabled={disabled}
        error={!!displayError}
        // O estado de foco é controlado naturalmente pelo Paper
        contentStyle={getContentStyle()}
        right={
          isLoading ? (
            <TextInput.Icon icon="loading" disabled />
          ) : searchQuery.length > 0 ? (
            <TextInput.Icon
              icon="close"
              onPress={() => {
                clearSearch();
                setShowDropdown(false);
              }}
              testID={`${testID}-clear`}
            />
          ) : undefined
        }
        testID={`${testID}-input`}
        accessible
        accessibilityLabel={typeof label === 'string' ? label : 'Buscar produtos'}
        accessibilityHint="Digite para buscar produtos. Use as setas para navegar pelos resultados."
        accessibilityState={{
          expanded: showDropdown,
          busy: isLoading
        }}
        accessibilityRole="search"
        {...otherProps}
      />

      {/* Chip renderizado sobre o input */}
      {selectedProduct && (
        <View style={styles.chipContainer}>
          <SimpleProductChip
            product={selectedProduct}
            onRemove={handleChipRemove}
            maxLength={20}
            variant="flat"
            testID={`${testID}-chip`}
          />
        </View>
      )}

      {/* Search Dropdown */}
      <SearchDropdown
        visible={showDropdown}
        searchResults={searchResults}
        activeIndex={activeIndex}
        onProductSelect={handleProductSelect}
        searchTerm={searchQuery}
        isLoading={isLoading}
        error={typeof displayError === 'string' ? displayError : null}
        isEmpty={isEmpty}
        maxHeight={dropdownMaxHeight}
        width={inputPosition.width}
        position={{
          x: inputPosition.x,
          y: inputPosition.y,
          inputHeight: inputPosition.height
        }}
        keyboardHeight={keyboardHeight}
        onDismiss={handleDropdownDismiss}
        testID={`${testID}-dropdown`}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    minHeight: 56,
  },
  chipContainer: {
    position: 'absolute',
    left: 12,
    top: 12,
    right: 48,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    maxWidth: '75%',
    pointerEvents: 'box-none',
  },
});

export default FocusAwareChipContainer;