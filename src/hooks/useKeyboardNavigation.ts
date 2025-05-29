import { useCallback, useEffect, useRef, useState } from 'react';

export interface KeyboardNavigationConfig {
  itemCount: number;
  onSelect?: (index: number) => void;
  onEscape?: () => void;
  onEnter?: (index: number) => void;
  loop?: boolean;
  disabled?: boolean;
}

export interface UseKeyboardNavigationReturn {
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  handleKeyDown: (event: any) => boolean;
  resetNavigation: () => void;
  navigateToIndex: (index: number) => void;
}

export function useKeyboardNavigation(
  config: KeyboardNavigationConfig
): UseKeyboardNavigationReturn {
  const [activeIndex, setActiveIndex] = useState(-1);
  const configRef = useRef(config);

  // Update config ref when config changes
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  const navigateToIndex = useCallback((index: number) => {
    const { itemCount } = configRef.current;
    if (itemCount === 0) {
      setActiveIndex(-1);
      return;
    }
    
    const newIndex = Math.max(-1, Math.min(index, itemCount - 1));
    setActiveIndex(newIndex);
  }, []);

  const resetNavigation = useCallback(() => {
    setActiveIndex(-1);
  }, []);

  const handleKeyDown = useCallback((event: any): boolean => {
    const { itemCount, onSelect, onEscape, onEnter, loop = true, disabled = false } = configRef.current;
    
    if (disabled || itemCount === 0) {
      return false;
    }

    const { key } = event;
    let handled = false;

    switch (key) {
      case 'ArrowDown': {
        event.preventDefault();
        handled = true;
        
        setActiveIndex(prevIndex => {
          if (prevIndex === -1) {
            return 0;
          }
          
          const nextIndex = prevIndex + 1;
          if (nextIndex >= itemCount) {
            return loop ? 0 : itemCount - 1;
          }
          
          return nextIndex;
        });
        break;
      }

      case 'ArrowUp': {
        event.preventDefault();
        handled = true;
        
        setActiveIndex(prevIndex => {
          if (prevIndex === -1 || prevIndex === 0) {
            return loop ? itemCount - 1 : 0;
          }
          
          return prevIndex - 1;
        });
        break;
      }

      case 'Enter': {
        if (activeIndex >= 0 && activeIndex < itemCount) {
          event.preventDefault();
          handled = true;
          onEnter?.(activeIndex);
          onSelect?.(activeIndex);
        }
        break;
      }

      case 'Escape': {
        event.preventDefault();
        handled = true;
        resetNavigation();
        onEscape?.();
        break;
      }

      case 'Home': {
        if (itemCount > 0) {
          event.preventDefault();
          handled = true;
          setActiveIndex(0);
        }
        break;
      }

      case 'End': {
        if (itemCount > 0) {
          event.preventDefault();
          handled = true;
          setActiveIndex(itemCount - 1);
        }
        break;
      }

      case 'Tab': {
        // Allow tab to close dropdown/reset navigation
        resetNavigation();
        break;
      }
    }

    return handled;
  }, [activeIndex, resetNavigation]);

  // Reset active index when item count changes
  useEffect(() => {
    if (config.itemCount === 0) {
      setActiveIndex(-1);
    } else if (activeIndex >= config.itemCount) {
      setActiveIndex(config.itemCount - 1);
    }
  }, [config.itemCount, activeIndex]);

  return {
    activeIndex,
    setActiveIndex: navigateToIndex,
    handleKeyDown,
    resetNavigation,
    navigateToIndex
  };
}