import React from 'react';
import { Appbar } from 'react-native-paper';
import { DrawerHeaderProps } from '@react-navigation/drawer';
import { getHeaderTitle } from '@react-navigation/elements';

type HeaderBarProps = DrawerHeaderProps;

export const HeaderBar = ({ navigation, route, options }: HeaderBarProps) => {
  const title = getHeaderTitle(options, route.name);

  return (
    <Appbar.Header elevated mode="medium">
      <Appbar.Action
        icon="menu"
        onPress={() => navigation.toggleDrawer()}
        accessibilityLabel="Menu"
      />
      <Appbar.Content
        title={title}
        accessibilityLabel={`Tela ${title}`}
      />
      {route.name === 'Produtos' && (
        <Appbar.Action
          icon="plus"
          onPress={() => console.log('Adicionar produto')}
          accessibilityLabel="Adicionar produto"
        />
      )}
      {route.name === 'Relatórios' && (
        <Appbar.Action
          icon="filter"
          onPress={() => console.log('Filtrar relatórios')}
          accessibilityLabel="Filtrar relatórios"
        />
      )}
    </Appbar.Header>
  );
};

export default HeaderBar;