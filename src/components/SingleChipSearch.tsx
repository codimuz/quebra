import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Text, useTheme } from 'react-native-paper';
import { Product } from '../data/products';
import { SearchResult } from '../utils/fuzzySearch';
import { useAdvancedSearch } from '../hooks/useAdvancedSearch';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';
import SearchDropdown from './SearchDropdown';
import SimpleProductChip from './SimpleProductChip';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

export interface SingleChipSearchProps {
  products: Product[];
  onSelectionChange: (product: Product | null) => void;
  selectedProduct?: Product | null;
  label?: string;
  placeholder?: string;
  maxResults?: number;
  debounceMs?: number;
  fuzzyThreshold?: number;
  disabled?: boolean;
  error?: string;
  loading?: boolean;
  autoFocus?: boolean;
  allowClear?: boolean;
  testID?: string;
}

const SingleChipSearch: React.FC<SingleChipSearchProps> = ({
  products,
  onSelectionChange,
  selectedProduct = null,
  label = 'Buscar Produtos',
  placeholder = 'Digite EAN ou descrição do produto...',
  maxResults = 10,
  debounceMs = 300,
  fuzzyThreshold = 0.6,
  disabled = false,
  error: externalError,
  loading: externalLoading = false,
  autoFocus = false,
  allowClear = true,
  testID = 'single-chip-search'
}) => {
  const theme = useTheme();
  const inputRef = useRef<any>(null);
  const containerRef = useRef<View>(null);
  
  // Estado local
  const [showDropdown, setShowDropdown] = useState(false);
  const [inputPosition, setInputPosition] = useState({ x: 0, y: 100, width: 300, height: 56 });
  const [containerLayout, setContainerLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Responsive layout hook
  const {
    keyboardHeight,
    dropdownMaxHeight,
    containerStyle: responsiveContainerStyle,
  } = useResponsiveLayout({
    containerWidth: containerLayout.width,
    inputHeight: inputPosition.height
  });

  // Advanced search hook
  const {
    searchResults,
    isLoading: searchLoading,
    error: searchError,
    searchQuery,
    setSearchQuery,
    clearSearch,
    hasResults,
    isEmpty,
    isSearching
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

  // Estados combinados
  const isLoading = searchLoading || externalLoading || isSearching;
  const displayError = searchError || externalError;
  const hasSelectedProduct = Boolean(selectedProduct);

  // Determinar se o container deve parecer "focado"
  const shouldShowFocusedState = isInputFocused || hasSelectedProduct;

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

  // Handle focus
  const handleFocus = useCallback(() => {
    setIsInputFocused(true);
    measureInput();
    
    if (searchQuery.trim().length > 0 || hasResults) {
      setShowDropdown(true);
    }
  }, [searchQuery, hasResults, measureInput]);

  // Handle blur  
  const handleBlur = useCallback(() => {
    setIsInputFocused(false);
    
    setTimeout(() => {
      setShowDropdown(false);
      resetNavigation();
    }, 200);
  }, [resetNavigation]);

  // Handle item selection
  function handleItemSelect(index?: number) {
    const targetIndex = index !== undefined ? index : activeIndex;
    
    if (targetIndex >= 0 && targetIndex < searchResults.length) {
      const selectedResult = searchResults[targetIndex];
      handleProductSelect(selectedResult);
    }
  }

  // Handle product selection - GARANTE SELEÇÃO ÚNICA
  const handleProductSelect = useCallback((result: SearchResult) => {
    const product = result.product;
    
    // Sempre substitui o produto anterior (seleção única)
    onSelectionChange(product);
    
    clearSearch();
    setShowDropdown(false);
    resetNavigation();
    
    // Manter foco para melhor UX
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, [onSelectionChange, clearSearch, resetNavigation]);

  // Handle chip removal
  const handleChipRemove = useCallback(() => {
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
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [autoFocus]);

  // Show dropdown when results are available
  useEffect(() => {
    if (isInputFocused && (hasResults || isEmpty || displayError) && searchQuery.trim().length > 0) {
      if (!showDropdown) {
        setShowDropdown(true);
        measureInput();
      }
    }
  }, [hasResults, isEmpty, displayError, searchQuery, isInputFocused, showDropdown, measureInput]);

  // Calcular padding do conteúdo baseado na presença do chip
  const getContentStyle = () => {
    if (!hasSelectedProduct) return undefined;
    
    return {
      paddingLeft: 100, // Espaço para o chip
      paddingRight: 48,  // Espaço para ícones
    };
  };

  // Determinar se deve mostrar o label
  const shouldShowLabel = !hasSelectedProduct || isInputFocused;

  return (
    <View
      style={[styles.container, responsiveContainerStyle]}
      ref={containerRef}
      onLayout={handleContainerLayout}
    >
      {/* TextInput principal */}
      <TextInput
        ref={inputRef}
        mode="outlined"
        label={shouldShowLabel ? label : ""}
        placeholder={hasSelectedProduct ? "Digite para buscar outro produto..." : placeholder}
        value={searchQuery}
        onChangeText={handleTextChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyPress={handleKeyPress}
        disabled={disabled}
        error={!!displayError}
        style={[
          styles.textInput,
          shouldShowFocusedState && styles.focusedInput
        ]}
        contentStyle={getContentStyle()}
        outlineStyle={hasSelectedProduct ? styles.inputWithChipOutline : undefined}
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
        accessibilityLabel={label}
        accessibilityHint="Digite para buscar produtos. Use as setas para navegar pelos resultados."
        accessibilityState={{
          expanded: showDropdown,
          busy: isLoading
        }}
        accessibilityRole="search"
      />

      {/* Chip do produto selecionado */}
      {hasSelectedProduct && selectedProduct && (
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

      {/* Label customizado quando há chip e input não está focado */}
      {hasSelectedProduct && !isInputFocused && !searchQuery && (
        <View style={styles.labelOverlay} pointerEvents="none">
          <Text style={[styles.labelText, { color: theme.colors.onSurfaceVariant }]}>
            {label}
          </Text>
        </View>
      )}

      {/* Texto de erro */}
      {displayError && (
        <Text 
          style={[styles.errorText, { color: theme.colors.error }]}
          accessible
          accessibilityRole="alert"
        >
          {displayError}
        </Text>
      )}

      {/* Dropdown de resultados */}
      <SearchDropdown
        visible={showDropdown}
        searchResults={searchResults}
        activeIndex={activeIndex}
        onProductSelect={handleProductSelect}
        searchTerm={searchQuery}
        isLoading={isLoading}
        error={displayError || null}
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
  textInput: {
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  focusedInput: {
    // Estilos adicionais quando deve parecer focado
  },
  inputWithChipOutline: {
    borderWidth: 1.5,
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
  labelOverlay: {
    position: 'absolute',
    left: 16,
    top: 8,
    zIndex: 5,
  },
  labelText: {
    fontSize: 12,
    fontWeight: '400',
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 16,
    fontWeight: '500',
  },
});

export default SingleChipSearch;