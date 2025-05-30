# Sistema de Motivos - Navigation Drawer

Este projeto implementa um sistema de gestão de produtos com Navigation Drawer usando React Native Paper.

## 🏗️ Arquitetura Implementada

### Estrutura de Pastas

```
src/
├── components/           # Componentes reutilizáveis
│   ├── GlobalFAB.tsx    # FAB global para todas as telas
│   ├── PaperProductDropdown.tsx
│   ├── ProductInputReplacement.tsx
│   └── SmartWeightInput.tsx
├── contexts/            # Contextos React
│   └── ThemeContext.tsx # Gerenciamento global do tema
├── navigation/          # Configuração de navegação
│   └── AppDrawer.tsx    # Navigation Drawer principal
├── screens/             # Telas da aplicação
│   ├── ProdutosScreen.tsx
│   ├── MotivosScreen.tsx
│   └── RelatoriosScreen.tsx
├── data/               # Dados e tipos
├── styles/             # Estilos globais
├── types/              # Definições de tipos
└── utils/              # Utilitários
```

## 🚀 Funcionalidades Implementadas

### Navigation Drawer
- **Produtos**: Seleção e gestão de produtos com busca por EAN/código
- **Motivos**: Gerenciamento de motivos de baixa com categorização
- **Relatórios**: Visualização de dados com diferentes formatos (resumo, detalhado, análise)

### Componentes Principais

#### GlobalFAB
- FAB consistente em todas as telas
- Ações personalizáveis por tela
- Suporte completo a acessibilidade
- Animações suaves

#### ThemeContext
- Gerenciamento global do tema (claro/escuro)
- Toggle de tema integrado ao drawer
- Persistência do estado do tema

#### CustomDrawerContent
- Header personalizado com avatar e informações
- Navegação entre telas
- Toggle de tema integrado
- Seções organizadas (navegação, configurações, ajuda)

## 🎨 Design System

### Material Design 3
- Componentes do React Native Paper v5+
- Temas consistentes (claro/escuro)
- Cores e tipografia padronizadas
- Animações e transições suaves

### Acessibilidade
- Labels descritivas para screen readers
- Suporte a navegação por teclado
- Contraste adequado entre cores
- Feedback tátil em interações

## 📱 Funcionalidades por Tela

### Tela de Produtos
- Busca inteligente por nome, descrição ou EAN
- Seleção de produto com leitor de código de barras
- Entrada de quantidade/peso
- Seleção de motivo
- FAB com ações de importar/exportar

### Tela de Motivos
- Lista categorizada de motivos
- Busca e filtros por categoria
- Seleção múltipla de motivos
- Gestão de motivos personalizados
- FAB com ações de adicionar/salvar

### Tela de Relatórios
- Três visualizações: Resumo, Detalhado, Análise
- Filtros por período
- Exportação em PDF/Excel
- Análise de tendências
- FAB com ações de exportar/compartilhar

## 🔧 Tecnologias Utilizadas

- **React Native** - Framework principal
- **React Native Paper v5** - Componentes Material Design 3
- **React Navigation v6** - Navegação entre telas
- **TypeScript** - Tipagem estática
- **Expo** - Plataforma de desenvolvimento

### Dependências Principais
```json
{
  "@react-navigation/native": "^6.x",
  "@react-navigation/drawer": "^6.x",
  "react-native-paper": "^5.x",
  "react-native-reanimated": "^3.x",
  "react-native-gesture-handler": "^2.x",
  "react-native-screens": "^3.x"
}
```

## 🚀 Como Executar

1. **Instalar dependências**
   ```bash
   npm install
   ```

2. **Executar o projeto**
   ```bash
   # Android
   npm run android
   
   # iOS
   npm run ios
   
   # Web
   npm run web
   ```

## 📝 Próximos Passos

### Melhorias Sugeridas
1. **Persistência de dados**: Implementar AsyncStorage ou banco local
2. **Offline support**: Cache de dados e sincronização
3. **Autenticação**: Sistema de login/logout
4. **Notificações**: Push notifications para alertas
5. **Testes**: Implementar testes unitários e de integração

### Customizações Possíveis
- Adicionar mais telas ao drawer
- Personalizar cores do tema
- Implementar filtros avançados
- Adicionar gráficos nos relatórios
- Integrar com APIs externas

## 🤝 Contribuição

Para contribuir com o projeto:
1. Faça um fork do repositório
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Abra um Pull Request

## 📄 Licença

Este projeto é licenciado sob a [MIT License](LICENSE).
