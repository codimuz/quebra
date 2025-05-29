import { useState, useCallback, useEffect, useRef } from 'react';
import { Product } from '../data/products';
import {
  ChipState,
  ChipPersistentState,
  ChipPersistentActions,
  ChipPersistentConfig,
  ChipStateTransition,
  CHIP_STATES,
  isValidTransition
} from '../types/chipStates';

/**
 * Hook para gerenciar o estado persistente do chip
 */
export const useChipPersistentState = (config: ChipPersistentConfig = {}) => {
  const {
    onSelectionChange,
    onStateChange,
    transitionDelay = 200,
    enablePersistence = true,
    initialProduct = null
  } = config;

  // Estado interno
  const [state, setState] = useState<ChipPersistentState>({
    state: initialProduct ? CHIP_STATES.SELECTED : CHIP_STATES.NONE,
    selectedProduct: initialProduct,
    isInputFocused: false,
    isPersistent: false,
    lastInteraction: Date.now()
  });

  // Refs para controle de timeouts e transições
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const transitionHistoryRef = useRef<ChipStateTransition[]>([]);

  /**
   * Adiciona uma transição ao histórico para debug
   */
  const addTransitionToHistory = useCallback((
    from: ChipState,
    to: ChipState,
    trigger: ChipStateTransition['trigger']
  ) => {
    const transition: ChipStateTransition = {
      from,
      to,
      trigger,
      timestamp: Date.now()
    };
    
    transitionHistoryRef.current.push(transition);
    
    // Manter apenas as últimas 10 transições
    if (transitionHistoryRef.current.length > 10) {
      transitionHistoryRef.current.shift();
    }
  }, []);

  /**
   * Executa uma transição de estado com validação
   */
  const executeTransition = useCallback((
    newChipState: ChipState,
    trigger: ChipStateTransition['trigger'],
    immediate = false
  ) => {
    const currentState = state.state;

    // Validar se a transição é permitida
    if (!isValidTransition(currentState, newChipState)) {
      console.warn(
        `Transição inválida de '${currentState}' para '${newChipState}' ignorada`
      );
      return false;
    }

    // Limpar timeout anterior se existir
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }

    const executeChange = () => {
      setState(prevState => {
        const newState: ChipPersistentState = {
          ...prevState,
          state: newChipState,
          isPersistent: newChipState === CHIP_STATES.PERSISTENT,
          lastInteraction: Date.now()
        };

        // Adicionar ao histórico
        addTransitionToHistory(currentState, newChipState, trigger);

        // Callback de mudança de estado
        onStateChange?.(newChipState);

        return newState;
      });
    };

    if (immediate || transitionDelay === 0) {
      executeChange();
    } else {
      transitionTimeoutRef.current = setTimeout(executeChange, transitionDelay);
    }

    return true;
  }, [state.state, transitionDelay, onStateChange, addTransitionToHistory]);

  /**
   * Seleciona um produto - GARANTIA DE SELEÇÃO ÚNICA
   */
  const selectProduct = useCallback((product: Product) => {
    setState(prevState => {
      // Se já há um produto selecionado e é diferente do novo,
      // isso substitui automaticamente (seleção única)
      const newState: ChipPersistentState = {
        ...prevState,
        selectedProduct: product, // Substitui qualquer produto anterior
        state: prevState.isInputFocused ? CHIP_STATES.ACTIVE : CHIP_STATES.SELECTED,
        lastInteraction: Date.now()
      };

      // Callback de mudança de seleção
      onSelectionChange?.(product);

      return newState;
    });

    // Adicionar transição ao histórico
    addTransitionToHistory(
      state.state,
      state.isInputFocused ? CHIP_STATES.ACTIVE : CHIP_STATES.SELECTED,
      'selection_change'
    );
  }, [state.state, state.isInputFocused, onSelectionChange, addTransitionToHistory]);

  /**
   * Remove o produto selecionado
   */
  const removeProduct = useCallback(() => {
    setState(prevState => {
      const newState: ChipPersistentState = {
        ...prevState,
        selectedProduct: null,
        state: CHIP_STATES.NONE,
        isPersistent: false,
        lastInteraction: Date.now()
      };

      // Callback de mudança de seleção
      onSelectionChange?.(null);

      return newState;
    });

    // Adicionar transição ao histórico
    addTransitionToHistory(state.state, CHIP_STATES.NONE, 'user_action');
  }, [state.state, onSelectionChange, addTransitionToHistory]);

  /**
   * Define o estado de foco do input
   */
  const setInputFocus = useCallback((focused: boolean) => {
    setState(prevState => {
      // Determinar novo estado baseado no foco e produto selecionado
      let newChipState: ChipState = prevState.state;
      
      if (focused) {
        // Input ganhou foco
        if (prevState.selectedProduct) {
          newChipState = CHIP_STATES.ACTIVE;
        }
      } else {
        // Input perdeu foco
        if (prevState.selectedProduct && enablePersistence) {
          newChipState = CHIP_STATES.PERSISTENT;
        } else if (prevState.selectedProduct) {
          newChipState = CHIP_STATES.SELECTED;
        }
      }

      const newState: ChipPersistentState = {
        ...prevState,
        isInputFocused: focused,
        state: newChipState,
        isPersistent: newChipState === CHIP_STATES.PERSISTENT,
        lastInteraction: Date.now()
      };

      // Adicionar transição ao histórico se o estado mudou
      if (newChipState !== prevState.state) {
        addTransitionToHistory(prevState.state, newChipState, 'focus_change');
        onStateChange?.(newChipState);
      }

      return newState;
    });
  }, [enablePersistence, onStateChange, addTransitionToHistory]);

  /**
   * Limpa todas as seleções
   */
  const clearAll = useCallback(() => {
    // Limpar timeout se existir
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }

    setState(prevState => {
      const newState: ChipPersistentState = {
        state: CHIP_STATES.NONE,
        selectedProduct: null,
        isInputFocused: prevState.isInputFocused,
        isPersistent: false,
        lastInteraction: Date.now()
      };

      // Callback de mudança de seleção
      onSelectionChange?.(null);

      return newState;
    });

    // Adicionar transição ao histórico
    addTransitionToHistory(state.state, CHIP_STATES.NONE, 'user_action');
  }, [state.state, onSelectionChange, addTransitionToHistory]);

  /**
   * Força um estado específico (para casos especiais)
   */
  const forceState = useCallback((newState: ChipState) => {
    executeTransition(newState, 'external', true);
  }, [executeTransition]);

  /**
   * Limpa timeouts quando o componente é desmontado
   */
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  // Ações disponíveis
  const actions: ChipPersistentActions = {
    selectProduct,
    removeProduct,
    setInputFocus,
    clearAll,
    forceState
  };

  // Propriedades computadas
  const hasProduct = Boolean(state.selectedProduct);
  const isActive = state.state === CHIP_STATES.ACTIVE;
  const isPersistent = state.state === CHIP_STATES.PERSISTENT;
  const isSelected = state.state === CHIP_STATES.SELECTED;
  const isEmpty = state.state === CHIP_STATES.NONE;

  // Debug info (apenas em desenvolvimento)
  const debugInfo = __DEV__ ? {
    transitionHistory: transitionHistoryRef.current,
    currentState: state,
    isValidTransition: (to: ChipState) => isValidTransition(state.state, to)
  } : undefined;

  return {
    // Estado atual
    ...state,
    
    // Ações
    ...actions,
    
    // Propriedades computadas
    hasProduct,
    isActive,
    isPersistent,
    isSelected,
    isEmpty,
    
    // Debug (apenas em desenvolvimento)
    debugInfo
  };
};

/**
 * Hook simplificado para casos básicos
 */
export const useSimpleChipState = (
  onSelectionChange?: (product: Product | null) => void,
  initialProduct?: Product | null
) => {
  return useChipPersistentState({
    onSelectionChange,
    initialProduct,
    enablePersistence: true,
    transitionDelay: 150
  });
};

export default useChipPersistentState;