import { useState, useEffect, useCallback } from 'react';
import { Dimensions, Keyboard, Platform, ViewStyle } from 'react-native';

interface ResponsiveLayoutConfig {
  containerWidth?: number;
  inputHeight?: number;
  keyboardPadding?: number;
}

interface ResponsiveLayoutReturn {
  screenDimensions: { width: number; height: number };
  keyboardHeight: number;
  orientation: 'portrait' | 'landscape';
  isTablet: boolean;
  dropdownMaxHeight: number;
  containerStyle: ViewStyle;
  getDropdownPosition: (inputY: number, inputHeight: number) => {
    top: number;
    maxHeight: number;
    showAbove: boolean;
  };
}

export const useResponsiveLayout = (
  config: ResponsiveLayoutConfig = {}
): ResponsiveLayoutReturn => {
  const [screenDimensions, setScreenDimensions] = useState(() => Dimensions.get('window'));
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const {
    containerWidth = screenDimensions.width,
    inputHeight = 56,
    keyboardPadding = 20
  } = config;

  // Determine device type and orientation
  const isTablet = screenDimensions.width >= 768;
  const orientation = screenDimensions.width > screenDimensions.height ? 'landscape' : 'portrait';

  // Calculate responsive dropdown max height
  const dropdownMaxHeight = Math.min(
    300,
    Math.floor(screenDimensions.height * (isTablet ? 0.4 : 0.35))
  );

  // Handle screen dimension changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  // Handle keyboard events
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  // Calculate optimal dropdown position
  const getDropdownPosition = useCallback((inputY: number, inputHeightParam: number) => {
    const actualInputHeight = inputHeightParam || inputHeight;
    const availableSpaceBelow = screenDimensions.height - inputY - actualInputHeight - keyboardHeight - keyboardPadding;
    const availableSpaceAbove = inputY - keyboardPadding;
    
    const preferredMaxHeight = dropdownMaxHeight;
    const showAbove = availableSpaceBelow < 150 && availableSpaceAbove > preferredMaxHeight;
    
    let finalTop: number;
    let finalMaxHeight: number;
    
    if (showAbove) {
      finalMaxHeight = Math.min(preferredMaxHeight, availableSpaceAbove);
      finalTop = inputY - finalMaxHeight;
    } else {
      finalMaxHeight = Math.min(preferredMaxHeight, Math.max(100, availableSpaceBelow));
      finalTop = inputY + actualInputHeight;
    }

    return {
      top: finalTop,
      maxHeight: finalMaxHeight,
      showAbove
    };
  }, [screenDimensions.height, keyboardHeight, keyboardPadding, dropdownMaxHeight, inputHeight]);

  // Generate responsive container style
  const containerStyle: ViewStyle = {
    width: '100%',
    maxWidth: isTablet ? 600 : '100%',
    alignSelf: isTablet ? 'center' : 'stretch',
    marginHorizontal: isTablet ? 'auto' : 0,
  };

  return {
    screenDimensions,
    keyboardHeight,
    orientation,
    isTablet,
    dropdownMaxHeight,
    containerStyle,
    getDropdownPosition,
  };
};

export default useResponsiveLayout;