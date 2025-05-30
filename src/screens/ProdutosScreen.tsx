import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Text,
  Card,
  useTheme,
  Button,
} from 'react-native-paper';
import { Dropdown } from 'react-native-paper-dropdown';
import ProductInputReplacement from '../components/ProductInputReplacement';
import SmartWeightInput from '../components/SmartWeightInput';
import GlobalFAB, { FABAction } from '../components/GlobalFAB';
import { PRODUCTS, Product } from '../data/products';

const MOTIVOS = [
  { label: '01 – Produto vencido', value: '01' },
  { label: '02 – Produto danificado', value: '02' },
  { label: '03 – Degustação (depósito)', value: '03' },
  { label: '04 – Degustação (loja)', value: '04' },
  { label: '05 – Furto interno', value: '05' },
  { label: '06 – Furto na área de vendas', value: '06' },
  { label: '07 – Alimento preparado para o refeitório', value: '07' },
  { label: '08 – Furto não recuperado', value: '08' },
  { label: '09 – Trocas ou devoluções', value: '09' },
  { label: '10 – Ajuste de inventário', value: '10' },
];

const ProductDisplay = ({ selectedProduct, weightValue }: { selectedProduct: Product; weightValue: string }) => {
  const theme = useTheme();
  const totalPrice = selectedProduct.preco * (parseFloat(weightValue) || 1);

  return (
    <Card
      mode="contained"
      style={[
        styles.productDisplayCard,
        {
          backgroundColor: theme.colors.surfaceVariant,
          borderColor: theme.colors.outline,
          shadowColor: theme.colors.shadow,
        }
      ]}
    >
      <Card.Content>
        <Text
          variant="titleMedium"
          style={[
            styles.productDisplayTitle,
            { color: theme.colors.primary }
          ]}
        >
          Produto Selecionado
        </Text>

        <View style={[
          styles.totalPriceContainer,
          {
            backgroundColor: theme.colors.primaryContainer,
            shadowColor: theme.colors.shadow,
          }
        ]}>
          <Text
            variant="titleMedium"
            style={[
              styles.totalPriceLabel,
              { color: theme.colors.onPrimaryContainer }
            ]}
          >
            Valor Total
          </Text>
          <Text
            variant="headlineMedium"
            style={[
              styles.totalPriceValue,
              { color: theme.colors.onPrimaryContainer }
            ]}
          >
            R$ {totalPrice.toFixed(2)}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
};

export default function ProdutosScreen() {
  const theme = useTheme();
  const [motivo, setMotivo] = useState<string>();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [weightValue, setWeightValue] = useState<string>('');

  const handleProductSelection = (product: Product | null) => {
    console.log('Produto selecionado:', product);
    setSelectedProduct(product);
    // Limpa o valor do peso quando muda o produto
    setWeightValue('');
  };

  const handleWeightChange = (value: string) => {
    setWeightValue(value);
    console.log('Peso/Quantidade:', value, selectedProduct?.unidade);
  };

  const fabActions: FABAction[] = [
    {
      icon: 'import',
      label: 'Importar',
      onPress: () => console.log('Pressed import'),
      accessibilityLabel: 'Importar produtos'
    },
    {
      icon: 'export',
      label: 'Exportar',
      onPress: () => console.log('Pressed export'),
      accessibilityLabel: 'Exportar produtos'
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView keyboardShouldPersistTaps={'handled'}>
        <View style={styles.formWrapper}>
          <View style={styles.motivoDropdown}>
            <Dropdown
              label={'Motivos'}
              placeholder="Selecionar motivo"
              options={MOTIVOS}
              value={motivo}
              onSelect={setMotivo}
              mode="outlined"
            />
          </View>

          <ProductInputReplacement
            products={PRODUCTS}
            label="Buscar Produto"
            placeholder="Digite nome, descrição ou EAN..."
            selectedProduct={selectedProduct}
            onSelectionChange={handleProductSelection}
            containerStyle={{
              marginVertical: 8,
            }}
            maintainExactDimensions={true}
          />

          <View style={styles.spacer} />
          <View style={styles.spacer} />
          <SmartWeightInput
            selectedProduct={selectedProduct}
            value={weightValue}
            onChangeText={handleWeightChange}
            label="Quantidade/Peso"
          />

          <Button
            mode="contained"
            onPress={() => {
              if (selectedProduct && weightValue && motivo) {
                console.log('Salvando:', {
                  produto: selectedProduct,
                  quantidade: weightValue,
                  motivo: motivo
                });
              } else {
                console.log('Preencha todos os campos');
              }
            }}
            disabled={!selectedProduct || !weightValue || !motivo}
            style={{ marginTop: 16 }}
          >
            Salvar
          </Button>
        </View>
      </ScrollView>
      
      <GlobalFAB actions={fabActions} />
    </View>
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
  productDisplayCard: {
    marginTop: 16,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderRadius: 12,
    borderWidth: 1,
  },
  productDisplayTitle: {
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  productInfoGrid: {
    gap: 12,
  },
  productInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 4,
    borderBottomWidth: 1,
  },
  productLabel: {
    fontWeight: '600',
    minWidth: 100,
    flex: 0.4,
  },
  productValue: {
    flex: 0.6,
    textAlign: 'right',
    flexWrap: 'wrap',
  },
  totalPriceContainer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  totalPriceLabel: {
    fontWeight: '600',
    marginBottom: 4,
  },
  totalPriceValue: {
    fontWeight: 'bold',
  },
  totalPrice: {
    fontWeight: 'bold',
    marginTop: 4,
  },
  motivoDropdown: {
    width: '100%',
    minWidth: 300,
    maxWidth: '100%',
  },
});
