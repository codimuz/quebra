import * as React from 'react';
import { View, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';
import { TextInput, HelperText, useTheme } from 'react-native-paper';
import { Product } from '../data/products';

// Habilita LayoutAnimation para Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export interface SmartWeightInputProps {
  selectedProduct: Product | null;
  value: string;
  onChangeText: (value: string) => void;
  label?: string;
  disabled?: boolean;
}

const SmartWeightInput: React.FC<SmartWeightInputProps> = ({
  selectedProduct,
  value,
  onChangeText,
  label = "Quantidade",
  disabled = false,
}) => {
  const theme = useTheme();
  const [hasError, setHasError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  
  // Determina o tipo de entrada baseado na unidade do produto
  const isKgUnit = selectedProduct?.unidade === 'KG';
  const isUnUnit = selectedProduct?.unidade === 'UN';
  
  // Configurações dinâmicas baseadas no tipo
  const inputConfig = React.useMemo(() => {
    if (!selectedProduct) {
      return {
        placeholder: "Selecione um produto primeiro",
        helperText: "Produto não selecionado",
        keyboardType: 'default' as const,
        maxLength: undefined,
      };
    }

    if (isKgUnit) {
      return {
        placeholder: "0.00",
        helperText: "Formato: quilogramas com 2 decimais (ex: 1.50)",
        keyboardType: 'decimal-pad' as const,
        maxLength: 10,
      };
    }

    if (isUnUnit) {
      return {
        placeholder: "0",
        helperText: "Formato: número inteiro de unidades (ex: 5)",
        keyboardType: 'number-pad' as const,
        maxLength: 6,
      };
    }

    return {
      placeholder: "0",
      helperText: `Unidade: ${selectedProduct.unidade}`,
      keyboardType: 'default' as const,
      maxLength: 10,
    };
  }, [selectedProduct, isKgUnit, isUnUnit]);

  // Função para formatar entrada de KG
  const formatKgInput = (text: string): string => {
    // Remove caracteres não numéricos exceto ponto
    let cleaned = text.replace(/[^0-9.]/g, '');
    
    // Garante apenas um ponto decimal
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      cleaned = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limita a 2 casas decimais
    if (parts[1] && parts[1].length > 2) {
      cleaned = parts[0] + '.' + parts[1].substring(0, 2);
    }
    
    // Limita o valor máximo (ex: 999.99)
    const numValue = parseFloat(cleaned);
    if (numValue > 999.99) {
      cleaned = '999.99';
    }
    
    return cleaned;
  };

  // Função para formatar entrada de UN
  const formatUnInput = (text: string): string => {
    // Remove caracteres não numéricos
    let cleaned = text.replace(/[^0-9]/g, '');
    
    // Limita o valor máximo (ex: 999999)
    const numValue = parseInt(cleaned);
    if (numValue > 999999) {
      cleaned = '999999';
    }
    
    return cleaned;
  };

  // Função de validação
  const validateInput = (text: string): { isValid: boolean; message: string } => {
    if (!selectedProduct) {
      return { isValid: false, message: 'Selecione um produto primeiro' };
    }

    if (!text || text.trim() === '') {
      return { isValid: false, message: 'Campo obrigatório' };
    }

    if (isKgUnit) {
      const numValue = parseFloat(text);
      if (isNaN(numValue) || numValue <= 0) {
        return { isValid: false, message: 'Insira um peso válido maior que zero' };
      }
      if (numValue > 999.99) {
        return { isValid: false, message: 'Peso máximo: 999.99 kg' };
      }
      // Verifica formato decimal correto
      if (!/^\d+(\.\d{1,2})?$/.test(text)) {
        return { isValid: false, message: 'Use formato: 0.00 (máximo 2 decimais)' };
      }
    }

    if (isUnUnit) {
      const numValue = parseInt(text);
      if (isNaN(numValue) || numValue <= 0) {
        return { isValid: false, message: 'Insira uma quantidade válida maior que zero' };
      }
      if (numValue > 999999) {
        return { isValid: false, message: 'Quantidade máxima: 999999 unidades' };
      }
      // Verifica se é número inteiro
      if (!/^\d+$/.test(text)) {
        return { isValid: false, message: 'Use apenas números inteiros' };
      }
    }

    return { isValid: true, message: '' };
  };

  // Handler para mudança de texto
  const handleTextChange = (text: string) => {
    let formattedText = text;

    // Aplica formatação baseada no tipo
    if (selectedProduct) {
      if (isKgUnit) {
        formattedText = formatKgInput(text);
      } else if (isUnUnit) {
        formattedText = formatUnInput(text);
      }
    }

    // Valida entrada
    const validation = validateInput(formattedText);
    setHasError(!validation.isValid);
    setErrorMessage(validation.message);

    // Chama callback com texto formatado
    onChangeText(formattedText);
  };

  // Efeito para animação quando muda o tipo de entrada
  React.useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [selectedProduct?.unidade]);

  // Renderização do componente
  return (
    <View style={styles.container}>
      <TextInput
        mode="outlined"
        label={label}
        placeholder={inputConfig.placeholder}
        value={value}
        onChangeText={handleTextChange}
        keyboardType={inputConfig.keyboardType}
        maxLength={inputConfig.maxLength}
        disabled={disabled || !selectedProduct}
        error={hasError}
        style={[
          styles.textInput,
          isKgUnit && styles.kgInput,
          isUnUnit && styles.unInput,
        ]}
        right={
          selectedProduct && (
            <TextInput.Affix 
              text={selectedProduct.unidade} 
              textStyle={[
                styles.unitAffix,
                { color: theme.colors.onSurfaceVariant }
              ]}
            />
          )
        }
      />
      
      <HelperText 
        type={hasError ? "error" : "info"} 
        visible={true}
        style={styles.helperText}
      >
        {hasError ? errorMessage : inputConfig.helperText}
      </HelperText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Container principal
  },
  textInput: {
    // Estilo base do input
  },
  kgInput: {
    // Estilo específico para input KG
  },
  unInput: {
    // Estilo específico para input UN
  },
  unitAffix: {
    fontWeight: '600',
    fontSize: 14,
  },
  helperText: {
    marginTop: 4,
  },
});

export default SmartWeightInput;