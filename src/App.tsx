
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Appbar,
  MD3DarkTheme,
  MD3LightTheme,
  PaperProvider,
  ThemeProvider,
  FAB,
  Portal,
} from 'react-native-paper';
import { Dropdown } from 'react-native-paper-dropdown';

const MOTIVOS = [
  { label: '01 – Produto vencido', value: '01' },
  { label: '02 – Produto danificado / impróprio para consumo', value: '02' },
  { label: '03 – Degustação (depósito)', value: '03' },
  { label: '04 – Degustação (loja)', value: '04' },
  { label: '05 – Furto interno', value: '05' },
  { label: '06 – Furto na área de vendas', value: '06' },
  { label: '07 – Alimento preparado para o refeitório', value: '07' },
  { label: '08 – Furto não recuperado', value: '08' },
  { label: '09 – Trocas ou devoluções', value: '09' },
  { label: '10 – Ajuste de inventário', value: '10' },
];

export default function App() {
  const [nightMode, setNightmode] = useState(false);
  const [motivo, setMotivo] = useState<string>();
  const [fabOpen, setFabOpen] = useState(false);
  const Theme = nightMode ? MD3DarkTheme : MD3LightTheme;

  const onFabStateChange = ({ open }: { open: boolean }) => setFabOpen(open);

  return (
    <ThemeProvider theme={Theme}>
      <PaperProvider theme={Theme}>
        <View
          style={[
            styles.container,
            { backgroundColor: Theme.colors.background },
          ]}
        >
          <Appbar.Header elevated>
            <Appbar.Content title={'Seleção de Motivos'} />
            <Appbar.Action
              icon={nightMode ? 'brightness-7' : 'brightness-3'}
              onPress={() => setNightmode(!nightMode)}
            />
          </Appbar.Header>
          <ScrollView keyboardShouldPersistTaps={'handled'}>
            <View style={styles.formWrapper}>
              <Dropdown
                label={'Motivos'}
                placeholder="Selecionar motivo"
                options={MOTIVOS}
                value={motivo}
                onSelect={setMotivo}
                mode="outlined"
              />
            </View>
          </ScrollView>
          <Portal>
            <FAB.Group
              open={fabOpen}
              visible
              icon={fabOpen ? 'calendar-today' : 'plus'}
              actions={[
                {
                  icon: 'import',
                  label: 'Importar',
                  onPress: () => console.log('Pressed import')
                },
                {
                  icon: 'export',
                  label: 'Exportar',
                  onPress: () => console.log('Pressed export'),
                },
              ]}
              onStateChange={onFabStateChange}
              onPress={() => {
                if (fabOpen) {
                  // do something if the speed dial is open
                }
              }}
            />
          </Portal>
        </View>
      </PaperProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formWrapper: {
    margin: 16,
  },
  spacer: {
    height: 16,
  },
});
