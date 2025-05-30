# Guia de Uso - ProductInputReplacement

Este componente permite substituir qualquer campo de input existente pelo sistema de busca e seleção de produtos, mantendo exatamente as mesmas dimensões, posicionamento e espaçamento visual no layout.

## 🎯 Funcionalidades Principais

### ✅ Substituição Completa de Input
- Mantém dimensões exatas do campo original
- Preserva posicionamento e espaçamento visual
- Transições suaves entre estados
- Gerenciamento automático de visibilidade

### ✅ Comportamento Inteligente
- **Seleção**: Campo de busca desaparece instantaneamente, substituído por chip visual
- **Remoção**: Chip removido via botão X, campo de busca reaparece na mesma posição
- **Animações**: Transições fluidas com Animated API do React Native
- **Estado**: Gerenciamento automático baseado na presença/ausência de produtos selecionados

## 📋 Exemplos de Uso

### 1. Substituição Simples (Recomendado)

```tsx
import ProductInputReplacement from './components/ProductInputReplacement';

// Substitui diretamente um input existente
<ProductInputReplacement
  products={PRODUCTS}
  selectedProduct={selectedProduct}
  onSelectionChange={handleProductSelection}
  label="Buscar Produto"
  placeholder="Digite nome, descrição ou EAN..."
  containerStyle={{
    marginVertical: 8,
  }}
  maintainExactDimensions={true}
/>
```

### 2. Posicionamento Absoluto (Para Sobreposição)

```tsx
// Sobrepor um input existente mantendo exatamente as mesmas coordenadas
<ProductInputReplacement
  products={PRODUCTS}
  selectedProduct={selectedProduct}
  onSelectionChange={handleProductSelection}
  position="absolute"
  top={inputLayout.y}
  left={inputLayout.x}
  width={inputLayout.width}
  height={inputLayout.height}
  zIndex={1000}
  maintainExactDimensions={true}
  label="Buscar Produto"
/>
```

### 3. Substituição com Dimensões Específicas

```tsx
// Controle total sobre dimensões e posicionamento
<ProductInputReplacement
  products={PRODUCTS}
  selectedProduct={selectedProduct}
  onSelectionChange={handleProductSelection}
  width={300}
  height={56}
  replaceInputStyle={{
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
  }}
  maintainExactDimensions={true}
/>
```

### 4. Integração com Formulários Existentes

```tsx
// Substituir um TextInput específico em um formulário
const MyForm = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  return (
    <View>
      {/* Outros campos do formulário */}
      <TextInput label="Nome" />
      <TextInput label="Email" />
      
      {/* Campo de produto substituído */}
      <ProductInputReplacement
        products={PRODUCTS}
        selectedProduct={selectedProduct}
        onSelectionChange={setSelectedProduct}
        containerStyle={styles.formField}
        label="Produto"
        placeholder="Buscar produto..."
      />
      
      {/* Mais campos */}
      <TextInput label="Observações" />
    </View>
  );
};
```

## 🔧 Props Disponíveis

### Props Básicas
- `products: Product[]` - Lista de produtos para busca
- `selectedProduct: Product | null` - Produto atualmente selecionado
- `onSelectionChange: (product: Product | null) => void` - Callback de seleção
- `label?: string` - Rótulo do campo
- `placeholder?: string` - Texto placeholder
- `disabled?: boolean` - Desabilitar o componente

### Props de Estilo e Posicionamento
- `replaceInputStyle?: ViewStyle` - Estilo para substituir input existente
- `containerStyle?: ViewStyle` - Estilo do container principal
- `maintainExactDimensions?: boolean` - Manter dimensões exatas (padrão: false)

### Props de Posicionamento Absoluto
- `position?: 'absolute' | 'relative'` - Tipo de posicionamento (padrão: 'relative')
- `top?: number` - Posição top (apenas com position='absolute')
- `left?: number` - Posição left (apenas com position='absolute')
- `right?: number` - Posição right (apenas com position='absolute')
- `bottom?: number` - Posição bottom (apenas com position='absolute')
- `width?: DimensionValue` - Largura específica
- `height?: DimensionValue` - Altura específica
- `zIndex?: number` - Z-index para sobreposição (padrão: 1000)

## 🎨 Estados e Animações

### Estado sem Produto Selecionado
```
┌─────────────────────────────────┐
│ 🔍 Buscar Produto               │
│ Digite nome, descrição ou EAN...│
└─────────────────────────────────┘
```

### Estado com Produto Selecionado
```
┌─────────────────────────────────┐
│ 🏷️ [1595 | BANANA CATURRA] ❌   │
│ BANANA CATURRA KG • R$ 2,49 (KG)│
└─────────────────────────────────┘
```

### Transições
- **Seleção**: Input desaparece (opacity: 1 → 0, scaleY: 1 → 0) em 300ms
- **Remoção**: Input reaparece (opacity: 0 → 1, scaleY: 0 → 1) em 300ms
- **Focus**: Campo de busca recebe foco automaticamente após remoção

## 📱 Compatibilidade

### Validação de Formulário
- Funciona com bibliotecas como Formik, React Hook Form
- Estado gerenciado através de `selectedProduct`
- Callbacks permitem integração com validadores

### Temas
- Herda automaticamente tema do react-native-paper
- Suporte completo ao Material Design 3
- Transição automática entre temas claro/escuro

### Plataformas
- ✅ React Native (iOS/Android)
- ✅ Expo
- ✅ Metro Bundler
- ✅ TypeScript

## 🚀 Benefícios

1. **Zero Refatoração**: Substitui inputs existentes sem alterar layout
2. **Transições Nativas**: Animações suaves usando Animated API
3. **Gerenciamento Automático**: Estado de visibilidade controlado automaticamente
4. **Flexibilidade Total**: Posicionamento absoluto ou relativo
5. **Compatibilidade**: Funciona com qualquer formulário React Native existente

## 📝 Exemplo Completo

```tsx
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput } from 'react-native-paper';
import ProductInputReplacement from './components/ProductInputReplacement';
import { PRODUCTS, Product } from './data/products';

const ProductForm = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState('');

  return (
    <View style={styles.form}>
      {/* Campo de produto com substituição inteligente */}
      <ProductInputReplacement
        products={PRODUCTS}
        selectedProduct={selectedProduct}
        onSelectionChange={setSelectedProduct}
        label="Produto"
        placeholder="Buscar por nome, EAN ou descrição..."
        containerStyle={styles.field}
        maintainExactDimensions={true}
      />
      
      {/* Campo normal que mantém funcionalidade */}
      <TextInput
        label="Quantidade"
        value={quantity}
        onChangeText={setQuantity}
        mode="outlined"
        style={styles.field}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  form: {
    padding: 16,
  },
  field: {
    marginVertical: 8,
  },
});
```

Este guia garante que você possa substituir qualquer input existente mantendo toda a funcionalidade, validação e experiência visual intactas.