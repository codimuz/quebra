import { useMemo, useRef, useState, useCallback } from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import {
  Appbar,
  Button,
  Divider,
  Headline,
  MD3DarkTheme,
  MD3LightTheme,
  PaperProvider,
  Paragraph,
  TextInput,
  ThemeProvider,
  TouchableRipple,
  Portal,
  FAB,
} from 'react-native-paper';
import {
  Dropdown,
  MultiSelectDropdown,
  DropdownInputProps,
  DropdownItemProps,
  DropdownRef,
} from 'react-native-paper-dropdown';
import SearchWithChips from './components/SearchWithChips';
import { PRODUCTS } from './data/products';

const OPTIONS = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
];

const MULTI_SELECT_OPTIONS = [
  {
    label: 'White',
    value: 'white',
  },
  {
    label: 'Red',
    value: 'red',
  },
  {
    label: 'Blue',
    value: 'blue',
  },
  {
    label: 'Green',
    value: 'green',
  },
  {
    label: 'Orange',
    value: 'orange',
  },
];

const CustomDropdownItem = ({
  width,
  option,
  value,
  onSelect,
  toggleMenu,
  isLast,
}: DropdownItemProps) => {
  const style: ViewStyle = useMemo(
    () => ({
      height: 50,
      width,
      backgroundColor:
        value === option.value
          ? MD3DarkTheme.colors.primary
          : MD3DarkTheme.colors.onPrimary,
      justifyContent: 'center',
      paddingHorizontal: 16,
    }),
    [option.value, value, width]
  );

  return (
    <>
      <TouchableRipple
        onPress={() => {
          onSelect?.(option.value);
          toggleMenu();
        }}
        style={style}
      >
        <Headline
          style={{
            color:
              value === option.value
                ? MD3DarkTheme.colors.onPrimary
                : MD3DarkTheme.colors.primary,
          }}
        >
          {option.label}
        </Headline>
      </TouchableRipple>
      {!isLast && <Divider />}
    </>
  );
};

const CustomDropdownInput = ({
  placeholder,
  selectedLabel,
  rightIcon,
}: DropdownInputProps) => {
  return (
    <TextInput
      mode="outlined"
      placeholder={placeholder}
      placeholderTextColor={MD3DarkTheme.colors.onSecondary}
      value={selectedLabel}
      style={{
        backgroundColor: MD3DarkTheme.colors.primary,
      }}
      textColor={MD3DarkTheme.colors.onPrimary}
      right={rightIcon}
    />
  );
};

export default function App() {
  const [nightMode, setNightmode] = useState(false);
  const [gender, setGender] = useState<string>();
  const [colors, setColors] = useState<string[]>([]);
  const [fabState, setFabState] = useState({ open: false });
  const refDropdown1 = useRef<DropdownRef>(null);
  const Theme = nightMode ? MD3DarkTheme : MD3LightTheme;

  const onFabStateChange = ({ open }: { open: boolean }) => setFabState({ open });

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
            <Appbar.Content title={'Dropdown Demo'} />
            <Appbar.Action
              icon={nightMode ? 'brightness-7' : 'brightness-3'}
              onPress={() => setNightmode(!nightMode)}
            />
          </Appbar.Header>
          <ScrollView
            showsVerticalScrollIndicator
            keyboardShouldPersistTaps={'handled'}
          >
            <View style={styles.formWrapper}>
              <Dropdown
                label={'Motivos'}
                placeholder="Selecionar motivo"
                options={OPTIONS}
                value={gender}
                onSelect={setGender}
                mode="outlined"
              />
              <View style={styles.spacer} />
              <SearchWithChips
                products={PRODUCTS}
                onSelectionChange={(products) => {
                  console.log('\n=== Produtos Selecionados ===');
                  console.log('Produtos selecionados:', products.length);
                  products.forEach(product => console.log(`- ${product.description} (EAN: ${product.ean}) - ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}`));
                  console.log('========================\n');
                }}
                label="Buscar Produtos"
                placeholder="Digite EAN ou descrição do produto..."
              />
              <View style={styles.spacer} />

              <TextInput
                mode="outlined"
                label="Peso/UN"
                placeholder="Digite o peso"
                right={<TextInput.Affix text="/100" />}
              />
              <View style={styles.spacer} />

              <View style={styles.spacer} />
              <View style={styles.spacer} />
              <Button
                mode={'contained'}
                onPress={() => {
                  setGender(undefined);
                }}
              >
                Salvar
              </Button>
              <View style={styles.spacer} />
              <View style={styles.spacer} />
            </View>
          </ScrollView>
          <Portal>
            <FAB.Group
              open={fabState.open}
              visible
              icon={fabState.open ? 'calendar-today' : 'plus'}
              actions={[
                { icon: 'plus', onPress: () => console.log('Pressed add') },
                {
                  icon: 'star',
                  label: 'Star',
                  onPress: () => console.log('Pressed star'),
                },
                {
                  icon: 'email',
                  label: 'Email',
                  onPress: () => console.log('Pressed email'),
                },
                {
                  icon: 'bell',
                  label: 'Remind',
                  onPress: () => console.log('Pressed notifications'),
                },
              ]}
              onStateChange={onFabStateChange}
              onPress={() => {
                if (fabState.open) {
                  // Ação quando o FAB estiver aberto
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
