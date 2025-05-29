import { useState, useCallback } from 'react';

/**
 * Hook simples para gerenciar estado de foco de contêiner com chips
 */
export const useFocusAwareState = (hasActiveChips: boolean) => {
  const [isInputFocused, setIsInputFocused] = useState(false);
  
  // O contêiner está "focado" se o input está focado OU há chips ativos
  const isContainerFocused = isInputFocused || hasActiveChips;
  
  const handleInputFocus = useCallback(() => {
    setIsInputFocused(true);
  }, []);
  
  const handleInputBlur = useCallback(() => {
    setIsInputFocused(false);
  }, []);
  
  return {
    isInputFocused,
    isContainerFocused,
    handleInputFocus,
    handleInputBlur,
    setInputFocus: setIsInputFocused
  };
};

export default useFocusAwareState;