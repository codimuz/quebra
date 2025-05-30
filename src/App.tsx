import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { AppThemeProvider } from './contexts/ThemeContext';
import { DatabaseProvider } from './contexts/DatabaseContext';
import AppDrawer from './navigation/AppDrawer';
import databaseConfig from './config/database';
import { DatabaseInitializer } from './components/DatabaseInitializer';

export default function App() {
  return (
    <AppThemeProvider>
      <PaperProvider>
        <NavigationContainer>
          <DatabaseProvider config={databaseConfig}>
            <DatabaseInitializer>
              <AppDrawer />
            </DatabaseInitializer>
          </DatabaseProvider>
        </NavigationContainer>
      </PaperProvider>
    </AppThemeProvider>
  );
}
