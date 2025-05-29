import { Product } from '../data/products';

/**
 * Estados possíveis do chip no componente SearchWithChips
 */
export type ChipState = 'none' | 'selected' | 'active' | 'persistent';

/**
 * Interface para o estado do chip persistente
 */
export interface ChipPersistentState {
  /** Estado atual do chip */
  state: ChipState;
  /** Produto selecionado (se houver) */
  selectedProduct: Product | null;
  /** Indica se o input está focado */
  isInputFocused: boolean;
  /** Indica se o chip está em modo persistente */
  isPersistent: boolean;
  /** Timestamp da última interação para debug */
  lastInteraction: number;
}

/**
 * Ações disponíveis para manipular o estado do chip
 */
export interface ChipPersistentActions {
  /** Seleciona um produto */
  selectProduct: (product: Product) => void;
  /** Remove o produto selecionado */
  removeProduct: () => void;
  /** Define o estado de foco do input */
  setInputFocus: (focused: boolean) => void;
  /** Limpa todas as seleções */
  clearAll: () => void;
  /** Força um estado específico (para casos especiais) */
  forceState: (state: ChipState) => void;
}

/**
 * Configurações para o hook useChipPersistentState
 */
export interface ChipPersistentConfig {
  /** Callback chamado quando o produto selecionado muda */
  onSelectionChange?: (product: Product | null) => void;
  /** Callback chamado quando o estado muda */
  onStateChange?: (state: ChipState) => void;
  /** Delay em ms para transições de estado */
  transitionDelay?: number;
  /** Se deve manter o estado persistente após blur */
  enablePersistence?: boolean;
  /** Produto inicial selecionado */
  initialProduct?: Product | null;
}

/**
 * Props para componentes que usam estado de chip
 */
export interface ChipStateProps {
  /** Estado atual do chip */
  chipState: ChipState;
  /** Se está em modo persistente */
  persistent?: boolean;
  /** Se deve mostrar indicador de estado */
  showStateIndicator?: boolean;
  /** Duração da animação em ms */
  animationDuration?: number;
}

/**
 * Eventos de transição de estado
 */
export interface ChipStateTransition {
  from: ChipState;
  to: ChipState;
  trigger: 'user_action' | 'focus_change' | 'selection_change' | 'external';
  timestamp: number;
}

/**
 * Estados ARIA para acessibilidade
 */
export interface ChipAriaStates {
  'aria-selected': boolean;
  'aria-persistent'?: boolean;
  'aria-expanded'?: boolean;
  'aria-live': 'polite' | 'assertive' | 'off';
  'aria-describedby'?: string;
}

/**
 * Mapeamento de estados para propriedades ARIA
 */
export const getAriaStates = (chipState: ChipState): ChipAriaStates => {
  const baseStates: ChipAriaStates = {
    'aria-selected': chipState !== 'none',
    'aria-live': 'polite'
  };

  switch (chipState) {
    case 'persistent':
      return {
        ...baseStates,
        'aria-persistent': true,
        'aria-live': 'polite'
      };
    
    case 'active':
      return {
        ...baseStates,
        'aria-expanded': true,
        'aria-live': 'assertive'
      };
    
    case 'selected':
      return {
        ...baseStates,
        'aria-live': 'polite'
      };
    
    default:
      return {
        'aria-selected': false,
        'aria-live': 'off'
      };
  }
};

/**
 * Constantes para estados
 */
export const CHIP_STATES = {
  NONE: 'none' as const,
  SELECTED: 'selected' as const,
  ACTIVE: 'active' as const,
  PERSISTENT: 'persistent' as const
} as const;

/**
 * Transições válidas entre estados
 */
export const VALID_TRANSITIONS: Record<ChipState, ChipState[]> = {
  none: ['selected'],
  selected: ['none', 'active', 'persistent'],
  active: ['none', 'selected', 'persistent'],
  persistent: ['none', 'active', 'selected']
};

/**
 * Verifica se uma transição de estado é válida
 */
export const isValidTransition = (from: ChipState, to: ChipState): boolean => {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
};