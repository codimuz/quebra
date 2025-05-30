import React from 'react';
import { Appbar, useTheme } from 'react-native-paper';
import { DrawerHeaderProps } from '@react-navigation/drawer';
import { getHeaderTitle } from '@react-navigation/elements';

type HeaderBarProps = DrawerHeaderProps;

export const HeaderBar = ({ navigation, route, options }: HeaderBarProps) => {
  const theme = useTheme();
  const title = getHeaderTitle(options, route.name);

  return (
    <Appbar.Header
      elevated
      mode="medium"
      style={{
        backgroundColor: theme.colors.surface,
      }}
    >
      <Appbar.Action
        icon="menu"
        onPress={() => navigation.toggleDrawer()}
        accessibilityLabel="Menu"
        iconColor={theme.colors.onSurface}
      />
      <Appbar.Content
        title={title}
        accessibilityLabel={`Tela ${title}`}
        titleStyle={{
          color: theme.colors.onSurface,
        }}
      />
      {route.name === 'Produtos' && (
        <Appbar.Action
          icon="plus"
          onPress={() => console.log('Adicionar produto')}
          accessibilityLabel="Adicionar produto"
          iconColor={theme.colors.onSurface}
        />
      )}
      {route.name === 'Relatórios' && (
        <Appbar.Action
          icon="filter"
          onPress={() => console.log('Filtrar relatórios')}
          accessibilityLabel="Filtrar relatórios"
          iconColor={theme.colors.onSurface}
        />
      )}
    </Appbar.Header>
  );
};

export default HeaderBar;