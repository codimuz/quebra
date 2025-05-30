import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import HeaderBar from '../components/HeaderBar';
import {
  Drawer as PaperDrawer,
  Text,
  useTheme,
  Divider,
  Avatar,
  Switch,
} from 'react-native-paper';
import { DrawerContentScrollView, DrawerContentComponentProps } from '@react-navigation/drawer';
import { useAppTheme } from '../contexts/ThemeContext';

// Importar as telas
import QuebrasScreen from '../screens/QuebrasScreen';
import MotivosScreen from '../screens/MotivosScreen';
import RelatoriosScreen from '../screens/RelatoriosScreen';
import ProdutosScreen from '../screens/ProdutosScreen';

const Drawer = createDrawerNavigator();

// Componente customizado para o conteúdo do drawer
function CustomDrawerContent(props: DrawerContentComponentProps) {
  const theme = useTheme();
  const { isDarkMode, toggleTheme } = useAppTheme();
  const { navigation, state } = props;
  
  const currentRoute = state.routeNames[state.index];

  return (
    <DrawerContentScrollView {...props}>
      <View style={[styles.drawerHeader, { backgroundColor: theme.colors.primaryContainer }]}>
        <Avatar.Icon 
          size={64} 
          icon="account" 
          style={{ backgroundColor: theme.colors.primary }}
        />
        <Text 
          variant="titleLarge" 
          style={[styles.drawerTitle, { color: theme.colors.onPrimaryContainer }]}
        >
          Sistema de Motivos
        </Text>
        <Text 
          variant="bodyMedium" 
          style={[styles.drawerSubtitle, { color: theme.colors.onPrimaryContainer }]}
        >
          Gestão de Quebras
        </Text>
      </View>

      <View style={styles.drawerContent}>
        <View style={styles.drawerSection}>
          <Text variant="labelLarge" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
            Principal
          </Text>
          <PaperDrawer.Item
            label="Produtos"
            icon="package-variant"
            active={currentRoute === 'Produtos'}
            onPress={() => navigation.navigate('Produtos')}
            style={styles.drawerItem}
          />

          <PaperDrawer.Item
            label="Quebras"
            icon="package-minus"
            active={currentRoute === 'Quebras'}
            onPress={() => navigation.navigate('Quebras')}
            style={styles.drawerItem}
            right={() => (
              <View style={[styles.badge, { backgroundColor: theme.colors.error }]}>
                <Text style={[styles.badgeText, { color: theme.colors.onError }]}>2</Text>
              </View>
            )}
          />

        
          <PaperDrawer.Item
            label="Motivos"
            icon="format-list-bulleted"
            active={currentRoute === 'Motivos'}
            onPress={() => navigation.navigate('Motivos')}
            style={styles.drawerItem}
          />
          
          <PaperDrawer.Item
            label="Relatórios"
            icon="chart-box"
            active={currentRoute === 'Relatórios'}
            onPress={() => navigation.navigate('Relatórios')}
            style={styles.drawerItem}
          />
        </View>

        <Divider style={[styles.divider, { backgroundColor: theme.colors.outline }]} />

        <View style={styles.drawerSection}>
          <Text variant="labelLarge" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
            Sistema
          </Text>

          <View style={styles.themeToggleContainer}>
            <PaperDrawer.Item
              label={isDarkMode ? "Modo Escuro" : "Modo Claro"}
              icon={isDarkMode ? "weather-night" : "white-balance-sunny"}
              onPress={toggleTheme}
              style={styles.drawerItem}
              right={() => (
                <Switch
                  value={isDarkMode}
                  onValueChange={toggleTheme}
                  style={styles.themeSwitch}
                />
              )}
            />
          </View>

          <PaperDrawer.Item
            label="Configurações"
            icon="cog-outline"
            onPress={() => console.log('Configurações')}
            style={styles.drawerItem}
          />
          
          <PaperDrawer.Item
            label="Ajuda"
            icon="help-circle-outline"
            onPress={() => console.log('Ajuda')}
            style={styles.drawerItem}
          />
        </View>

        <View style={styles.drawerFooter}>
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Versão 1.0.0
          </Text>
        </View>
      </View>
    </DrawerContentScrollView>
  );
}

export default function AppDrawer() {
  const theme = useTheme();

  return (
    <NavigationContainer>
      <Drawer.Navigator
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          header: (props) => <HeaderBar {...props} />,
          headerShown: true,
          drawerStyle: {
            backgroundColor: theme.colors.surface,
          },
          drawerContentStyle: {
            backgroundColor: theme.colors.surface,
          },
          drawerActiveTintColor: theme.colors.primary,
          drawerInactiveTintColor: theme.colors.onSurface,
        }}
      >
        <Drawer.Screen
          name="Produtos"
          component={ProdutosScreen}
        />
        <Drawer.Screen
          name="Quebras"
          component={QuebrasScreen}
        />
        <Drawer.Screen 
          name="Motivos" 
          component={MotivosScreen}
        />
        <Drawer.Screen 
          name="Relatórios" 
          component={RelatoriosScreen}
        />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  drawerSection: {
    marginBottom: 8,
  },
  sectionTitle: {
    marginLeft: 16,
    marginTop: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  drawerHeader: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  drawerTitle: {
    marginTop: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  drawerSubtitle: {
    marginTop: 4,
    textAlign: 'center',
    opacity: 0.8,
  },
  drawerContent: {
    paddingHorizontal: 8,
  },
  drawerItem: {
    marginVertical: 2,
    borderRadius: 8,
  },
  divider: {
    marginVertical: 8,
    marginHorizontal: 8,
  },
  themeToggleContainer: {
    marginBottom: 8,
  },
  themeSwitch: {
    alignSelf: 'center',
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  drawerFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    alignItems: 'center',
  },
});
