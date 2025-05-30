import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, HelperText } from 'react-native-paper';
import { Product, ProductFormData } from '../types/product';

interface ProductFormProps {
  initialData?: Product;
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function ProductForm({
  initialData,
  onSubmit,
  onCancel,
  loading = false
}: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    product_code: initialData?.product_code || '',
    name: initialData?.name || '',
    description: initialData?.description || '',
    brand: initialData?.brand || '',
    regular_price: initialData?.regular_price || 0,
    unit_type: initialData?.unit_type || 'UN'
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormData, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formData.product_code.trim()) {
      newErrors.product_code = 'Código do produto é obrigatório';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Nome do produto é obrigatório';
    }

    if (formData.regular_price <= 0) {
      newErrors.regular_price = 'Preço deve ser maior que zero';
    }

    if (!['KG', 'UN', 'L', 'M2', 'M3'].includes(formData.unit_type)) {
      newErrors.unit_type = 'Tipo de unidade inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        await onSubmit(formData);
      } catch (error) {
        console.error('Erro ao salvar produto:', error);
      }
    }
  };

  return (
    <ScrollView style={styles.container}>
      <TextInput
        label="Código do Produto"
        value={formData.product_code}
        onChangeText={(text) => setFormData({ ...formData, product_code: text })}
        error={!!errors.product_code}
        disabled={loading}
        style={styles.input}
      />
      <HelperText type="error" visible={!!errors.product_code}>
        {errors.product_code}
      </HelperText>

      <TextInput
        label="Nome do Produto"
        value={formData.name}
        onChangeText={(text) => setFormData({ ...formData, name: text })}
        error={!!errors.name}
        disabled={loading}
        style={styles.input}
      />
      <HelperText type="error" visible={!!errors.name}>
        {errors.name}
      </HelperText>

      <TextInput
        label="Descrição"
        value={formData.description}
        onChangeText={(text) => setFormData({ ...formData, description: text })}
        disabled={loading}
        multiline
        style={styles.input}
      />

      <TextInput
        label="Marca"
        value={formData.brand}
        onChangeText={(text) => setFormData({ ...formData, brand: text })}
        disabled={loading}
        style={styles.input}
      />

      <TextInput
        label="Preço"
        value={formData.regular_price.toString()}
        onChangeText={(text) => {
          const price = parseFloat(text.replace(',', '.'));
          setFormData({ ...formData, regular_price: isNaN(price) ? 0 : price });
        }}
        error={!!errors.regular_price}
        disabled={loading}
        keyboardType="decimal-pad"
        style={styles.input}
      />
      <HelperText type="error" visible={!!errors.regular_price}>
        {errors.regular_price}
      </HelperText>

      <TextInput
        label="Tipo de Unidade"
        value={formData.unit_type}
        onChangeText={(text) => setFormData({ ...formData, unit_type: text.toUpperCase() as any })}
        error={!!errors.unit_type}
        disabled={loading}
        style={styles.input}
      />
      <HelperText type="error" visible={!!errors.unit_type}>
        {errors.unit_type}
      </HelperText>

      <View style={styles.buttons}>
        <Button
          mode="outlined"
          onPress={onCancel}
          disabled={loading}
          style={styles.button}
        >
          Cancelar
        </Button>
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={styles.button}
        >
          {initialData ? 'Atualizar' : 'Criar'}
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  input: {
    marginBottom: 4,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 16,
  },
  button: {
    minWidth: 120,
  },
});