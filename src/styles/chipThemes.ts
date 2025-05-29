import { StyleSheet } from 'react-native';
import { MD3Theme } from 'react-native-paper';
import { ChipState } from '../types/chipStates';

/**
 * Configurações de z-index para diferentes elementos
 */
export const Z_INDEX = {
  INPUT: 1,
  CHIP: 20,
  LABEL_OVERLAY: 15,
  DROPDOWN: 100,
  MODAL: 1000
} as const;

/**
 * Configurações de animação
 */
export const ANIMATION_CONFIG = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500
  },
  easing: {
    default: 'ease-in-out',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)'
  }
} as const;

/**
 * Gera estilos para o chip baseado no estado e tema
 */
export const getChipStyles = (
  chipState: ChipState,
  theme: MD3Theme,
  variant: 'outlined' | 'flat' = 'flat'
) => {
  const baseStyles = StyleSheet.create({
    chip: {
      marginRight: 8,
      marginBottom: 2,
      marginTop: 2,
      maxWidth: 200,
      minHeight: 32,
      alignSelf: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 3,
      zIndex: Z_INDEX.CHIP,
    },
    chipText: {
      fontSize: 12,
      fontWeight: '600' as const,
      lineHeight: 16,
    }
  });

  // Estilos específicos por estado
  const stateStyles = (() => {
    switch (chipState) {
      case 'none':
        return StyleSheet.create({
          chip: {},
          chipText: {}
        });

      case 'selected':
        return StyleSheet.create({
          chip: {
            backgroundColor: variant === 'outlined'
              ? theme.colors.surface
              : theme.colors.secondaryContainer,
            borderColor: variant === 'outlined'
              ? theme.colors.outline
              : 'transparent',
            borderWidth: variant === 'outlined' ? 1.5 : 0,
            opacity: 1,
            transform: [{ scale: 1 }],
          },
          chipText: {
            color: variant === 'outlined'
              ? theme.colors.onSurface
              : theme.colors.onSecondaryContainer,
          }
        });

      case 'active':
        return StyleSheet.create({
          chip: {
            backgroundColor: variant === 'outlined'
              ? theme.colors.surfaceVariant
              : theme.colors.primaryContainer,
            borderColor: variant === 'outlined'
              ? theme.colors.primary
              : 'transparent',
            borderWidth: variant === 'outlined' ? 2 : 0,
            opacity: 1,
            transform: [{ scale: 1.02 }],
            elevation: 4,
            shadowOpacity: 0.15,
          },
          chipText: {
            color: variant === 'outlined'
              ? theme.colors.onSurfaceVariant
              : theme.colors.onPrimaryContainer,
            fontWeight: '700' as const,
          }
        });

      case 'persistent':
        return StyleSheet.create({
          chip: {
            backgroundColor: variant === 'outlined'
              ? theme.colors.surface
              : theme.colors.tertiaryContainer,
            borderColor: variant === 'outlined'
              ? theme.colors.outlineVariant
              : 'transparent',
            borderWidth: variant === 'outlined' ? 1 : 0,
            opacity: 0.9,
            transform: [{ scale: 0.98 }],
            elevation: 2,
          },
          chipText: {
            color: variant === 'outlined'
              ? theme.colors.onSurface
              : theme.colors.onTertiaryContainer,
            opacity: 0.9,
          }
        });

      default:
        return StyleSheet.create({
          chip: {},
          chipText: {}
        });
    }
  })();

  return {
    chip: [baseStyles.chip, stateStyles.chip],
    chipText: [baseStyles.chipText, stateStyles.chipText]
  };
};

/**
 * Estilos para o container do chip
 */
export const getChipContainerStyles = (chipState: ChipState, theme: MD3Theme) => {
  return StyleSheet.create({
    container: {
      position: 'absolute' as const,
      left: 12,
      top: chipState === 'active' ? 10 : 12,
      right: 48,
      zIndex: Z_INDEX.CHIP,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      flexWrap: 'wrap' as const,
      maxWidth: '75%',
      pointerEvents: 'box-none' as const,
      opacity: chipState === 'none' ? 0 : 1,
    }
  });
};

/**
 * Estilos para o label overlay customizado
 */
export const getLabelOverlayStyles = (chipState: ChipState, theme: MD3Theme) => {
  const isVisible = chipState === 'persistent' || chipState === 'selected';
  
  return StyleSheet.create({
    overlay: {
      position: 'absolute' as const,
      left: 16,
      top: isVisible ? -8 : 16,
      zIndex: Z_INDEX.LABEL_OVERLAY,
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 4,
      opacity: isVisible ? 1 : 0,
      transform: [
        { 
          scale: isVisible ? 0.75 : 1 
        }
      ],
    },
    labelText: {
      fontSize: isVisible ? 12 : 16,
      color: theme.colors.onSurfaceVariant,
      fontWeight: '400' as const,
    }
  });
};

/**
 * Estilos para o input baseado no estado do chip
 */
export const getInputStyles = (chipState: ChipState, theme: MD3Theme) => {
  const hasChip = chipState !== 'none';
  
  return StyleSheet.create({
    textInput: {
      backgroundColor: 'transparent',
      zIndex: Z_INDEX.INPUT,
    },
    contentStyle: hasChip ? {
      paddingLeft: 100, // Espaço para o chip
      paddingRight: 48,  // Espaço para ícones
      paddingTop: chipState === 'persistent' ? 8 : 4,
    } : {
      paddingRight: 48,
    },
    outlineStyle: hasChip ? {
      borderWidth: chipState === 'active' ? 2 : 1.5,
      borderColor: chipState === 'active'
        ? theme.colors.primary
        : theme.colors.outline,
    } : {},
  });
};

/**
 * Estilos para indicadores de estado (opcionais)
 */
export const getStateIndicatorStyles = (chipState: ChipState, theme: MD3Theme) => {
  return StyleSheet.create({
    indicator: {
      position: 'absolute' as const,
      top: -2,
      right: -2,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: (() => {
        switch (chipState) {
          case 'active':
            return theme.colors.primary;
          case 'persistent':
            return theme.colors.tertiary;
          case 'selected':
            return theme.colors.secondary;
          default:
            return 'transparent';
        }
      })(),
      opacity: chipState === 'none' ? 0 : 1,
      zIndex: Z_INDEX.CHIP + 1,
    }
  });
};

/**
 * Configurações de transição para animações
 */
export const getTransitionConfig = (chipState: ChipState) => {
  return {
    duration: chipState === 'active' 
      ? ANIMATION_CONFIG.duration.fast 
      : ANIMATION_CONFIG.duration.normal,
    useNativeDriver: true,
    easing: chipState === 'active'
      ? ANIMATION_CONFIG.easing.bounce
      : ANIMATION_CONFIG.easing.smooth
  };
};

/**
 * Estilos base para o container principal
 */
export const getContainerStyles = (theme: MD3Theme) => {
  return StyleSheet.create({
    container: {
      position: 'relative' as const,
      minHeight: 56,
      backgroundColor: 'transparent',
    },
    errorText: {
      fontSize: 12,
      marginTop: 4,
      marginLeft: 16,
      fontWeight: '500' as const,
      color: theme.colors.error,
    }
  });
};

/**
 * Função utilitária para combinar estilos baseado no estado
 */
export const combineStateStyles = (
  chipState: ChipState,
  theme: MD3Theme,
  variant: 'outlined' | 'flat' = 'flat'
) => {
  return {
    chip: getChipStyles(chipState, theme, variant),
    container: getChipContainerStyles(chipState, theme),
    labelOverlay: getLabelOverlayStyles(chipState, theme),
    input: getInputStyles(chipState, theme),
    stateIndicator: getStateIndicatorStyles(chipState, theme),
    mainContainer: getContainerStyles(theme),
    transition: getTransitionConfig(chipState)
  };
};