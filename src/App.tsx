import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { AppThemeProvider, useAppTheme } from './contexts/ThemeContext';
import { DatabaseProvider } from './contexts/DatabaseContext';
import { DatabaseInitializer } from './components/DatabaseInitializer';
import { DB_CONFIG } from './config/database';
import AppDrawer from './navigation/AppDrawer';

function AppContent() {
  const { theme } = useAppTheme();

  return (
    <PaperProvider theme={theme}>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <DatabaseInitializer>
          <AppDrawer />
        </DatabaseInitializer>
      </View>
    </PaperProvider>
  );
}

export default function App() {
  return (
    <AppThemeProvider>
      <DatabaseProvider config={DB_CONFIG}>
        <AppContent />
      </DatabaseProvider>
    </AppThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
