import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

// Tema escuro aprimorado com paleta completa MD3
export const customDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    // Cores de superfície e elevação
    elevation: {
      level0: 'transparent',
      level1: '#2C2C2C',
      level2: '#333333',
      level3: '#383838',
      level4: '#3F3F3F',
      level5: '#444444',
    },
    // Cores primárias e variantes
    primary: '#D0BCFF',
    onPrimary: '#381E72',
    primaryContainer: '#4F378B',
    onPrimaryContainer: '#EADDFF',
    // Cores secundárias e variantes
    secondary: '#CCC2DC',
    onSecondary: '#332D41',
    secondaryContainer: '#4A4458',
    onSecondaryContainer: '#E8DEF8',
    // Cores terciárias e variantes
    tertiary: '#EFB8C8',
    onTertiary: '#492532',
    tertiaryContainer: '#633B48',
    onTertiaryContainer: '#FFD8E4',
    // Cores de superfície
    surface: '#1C1B1F',
    onSurface: '#E6E1E5',
    surfaceVariant: '#49454F',
    onSurfaceVariant: '#CAC4D0',
    surfaceDisabled: '#1C1B1F',
    onSurfaceDisabled: '#1C1B1F',
    // Cores de fundo
    background: '#1C1B1F',
    onBackground: '#E6E1E5',
    // Cores de erro
    error: '#FFB4AB',
    onError: '#690005',
    errorContainer: '#93000A',
    onErrorContainer: '#FFB4AB',
    // Cores de contorno
    outline: '#938F99',
    outlineVariant: '#49454F',
    // Estados interativos
    ripple: '#FFFFFF20',
    scrim: '#000000',
  },
};

// Mantendo o tema claro padrão do MD3
export const customLightTheme = {
  ...MD3LightTheme,
};
