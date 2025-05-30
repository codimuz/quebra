import React from 'react';
import { View, StyleSheet } from 'react-native';
import {
  PaperProvider,
  ThemeProvider,
} from 'react-native-paper';
import { AppThemeProvider, useAppTheme } from './contexts/ThemeContext';
import AppDrawer from './navigation/AppDrawer';

function AppContent() {
  const { theme } = useAppTheme();

  return (
    <ThemeProvider theme={theme}>
      <PaperProvider theme={theme}>
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
          <AppDrawer />
        </View>
      </PaperProvider>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <AppThemeProvider>
      <AppContent />
    </AppThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
