import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { AppThemeProvider, useAppTheme } from './contexts/ThemeContext';
import AppDrawer from './navigation/AppDrawer';

function AppContent() {
  const { theme } = useAppTheme();

  return (
    <PaperProvider theme={theme}>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <AppDrawer />
      </View>
    </PaperProvider>
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
