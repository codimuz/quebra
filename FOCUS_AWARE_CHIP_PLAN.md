# Plano: Componente Focus-Aware com React Native Paper

## Objetivo Revisado

Criar um componente React Native que mantenha o estado de foco em um contêiner quando qualquer chip dentro dele estiver selecionado ou ativo, **sem modificar as cores padrão** e permitindo que o React Native Paper cuide das decisões de estilo.

## Abordagem Simplificada

### Princípios
1. **Usar apenas recursos nativos do React Native Paper**
2. **Não sobrescrever cores ou estilos padrão**
3. **Focar no comportamento de foco do contêiner**
4. **Implementação limpa e minimalista**

### Componente Principal: `FocusAwareChipContainer`

#### Funcionalidades
- **Estado de Foco Persistente**: O contêiner mantém aparência "focada" quando contém chips ativos
- **Integração Nativa**: Usa props nativas do TextInput para controlar foco
- **Sem Customização Visual**: Deixa o React Native Paper gerenciar todas as cores e estilos
- **Comportamento Intuitivo**: Foco visual baseado na presença de chips selecionados

#### Props do Componente
```typescript
interface FocusAwareChipContainerProps {
  children: React.ReactNode;
  hasActiveChips: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  inputRef?: React.RefObject<any>;
  label?: string;
  placeholder?: string;
  // Todas as outras props do TextInput do Paper
}
```

#### Comportamento do Foco
1. **Container Focused**: Quando o input está focado OU há chips ativos
2. **Container Blurred**: Apenas quando o input não está focado E não há chips
3. **Transição Automática**: React Native Paper gerencia as animações naturalmente

### Implementação

#### Hook: `useFocusAwareState`
```typescript
const useFocusAwareState = (hasActiveChips: boolean) => {
  const [isInputFocused, setIsInputFocused] = useState(false);
  
  // O contêiner está "focado" se o input está focado OU há chips ativos
  const isContainerFocused = isInputFocused || hasActiveChips;
  
  return {
    isInputFocused,
    isContainerFocused,
    setInputFocus: setIsInputFocused
  };
};
```

#### Componente Principal
- **TextInput com foco controlado**: Usa a prop `focused` nativa do Paper
- **Chips integrados**: Renderizados dentro do input usando a estrutura nativa
- **Label inteligente**: Se comporta naturalmente com a presença de chips

### Vantagens da Abordagem

1. **Simplicidade**: Código mínimo e direto
2. **Compatibilidade**: Funciona perfeitamente com temas do Paper
3. **Manutenibilidade**: Sem customizações complexas para quebrar
4. **Performance**: Usa apenas recursos nativos, sem overhead
5. **Acessibilidade**: Mantém todos os recursos de acessibilidade do Paper

### Estrutura de Arquivos

```
src/
├── components/
│   ├── FocusAwareChipContainer.tsx    (novo - componente principal)
│   └── SimpleProductChip.tsx          (simplificado)
├── hooks/
│   └── useFocusAwareState.ts          (novo - hook simples)
└── App.tsx                            (exemplo de uso)
```

### Exemplo de Uso

```typescript
<FocusAwareChipContainer
  hasActiveChips={selectedProducts.length > 0}
  label="Buscar Produtos"
  placeholder="Digite para buscar..."
>
  {selectedProducts.map(product => (
    <SimpleProductChip
      key={product.id}
      product={product}
      onRemove={() => removeProduct(product.id)}
    />
  ))}
</FocusAwareChipContainer>
```

## Implementação Imediata

Este plano será implementado imediatamente, substituindo a abordagem complexa anterior por uma solução elegante e simples que aproveita ao máximo os recursos nativos do React Native Paper.