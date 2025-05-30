# 🔧 Instruções de Configuração - Navigation Drawer

## ⚠️ Resolvendo Erro do React Native Reanimated

Se você encontrou o erro:
```
ReanimatedError: [Reanimated] Native part of Reanimated doesn't seem to be initialized
```

## ✅ Solução Completa

### 1. **Configuração do Babel (JÁ FEITA)**
O arquivo `babel.config.js` já foi configurado com o plugin do Reanimated:

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin', // ✅ Plugin adicionado
      // ... outros plugins
    ],
  };
};
```

### 2. **Reinstalar Dependências Compatíveis**
```bash
# Instalar versões compatíveis com Expo SDK 51
npx expo install react-native-gesture-handler react-native-reanimated react-native-screens react-native-safe-area-context
```

### 3. **Limpar Cache e Reiniciar**
```bash
# Pare qualquer servidor em execução (Ctrl+C)

# Limpe o cache
npx expo start --clear

# Ou alternativamente
npm start -- --clear
```

### 4. **Reiniciar o App Completamente**
- **Android**: Feche o app completamente e abra novamente
- **iOS**: Feche o app e abra novamente
- **Web**: Recarregue a página (F5)

### 5. **Se o problema persistir (Desenvolvimento Bare)**
Para projetos bare React Native (não Expo managed):

```bash
# Limpar cache do Metro
npx react-native start --reset-cache

# Android
cd android && ./gradlew clean && cd ..

# iOS
cd ios && xcodebuild clean && cd ..
```

## 🚀 Executando o Projeto

```bash
# 1. Instalar dependências
npm install

# 2. Limpar cache
npx expo start --clear

# 3. Executar
npm run android  # Android
npm run ios      # iOS
npm run web      # Web
```

## 📱 Testando a Funcionalidade

Após a configuração, você deve ser capaz de:

1. ✅ **Abrir o app** sem erros de Reanimated
2. ✅ **Navegar pelo drawer** (swipe da esquerda ou botão do menu)
3. ✅ **Alternar entre temas** usando o switch no drawer
4. ✅ **Usar o FAB** em todas as telas
5. ✅ **Navegar entre Produtos, Motivos e Relatórios**

## 🔍 Verificação de Funcionamento

### Navigation Drawer
- Arraste da borda esquerda para abrir
- Clique no menu (☰) se disponível
- Navegue entre as 3 telas principais

### Tema Dinâmico
- Abra o drawer
- Use o switch "Modo Escuro/Claro"
- Veja a mudança instantânea de cores

### FAB Global
- Cada tela tem um FAB específico
- Produtos: Importar/Exportar
- Motivos: Adicionar/Salvar
- Relatórios: Exportar PDF/Excel/Compartilhar

## 🐛 Troubleshooting Adicional

### Erro persiste após cache clear?
```bash
# Remover node_modules
rm -rf node_modules
npm install

# Limpar tudo
npx expo start --clear
```

### Ainda com problemas?
1. Verifique se está usando Expo SDK 51
2. Verifique se o React Native está atualizado
3. Tente criar um novo projeto Expo e copiar os arquivos

### Para Desenvolvimento Local
Se estiver desenvolvendo a biblioteca localmente:
```bash
# No diretório raiz
npm pack
# Use o arquivo .tgz gerado em outros projetos
```

## 📄 Arquivos Importantes Modificados

- ✅ `babel.config.js` - Plugin do Reanimated adicionado
- ✅ `package.json` - Dependências atualizadas
- ✅ `src/navigation/AppDrawer.tsx` - Navigation Drawer implementado
- ✅ `src/contexts/ThemeContext.tsx` - Gerenciamento de tema
- ✅ `src/components/GlobalFAB.tsx` - FAB reutilizável
- ✅ `src/screens/` - Telas completas implementadas

## ✨ Resultado Esperado

Um app funcionando com:
- 📱 Navigation Drawer fluido
- 🌓 Alternação de tema dinâmica
- 🎯 FAB consistente em todas as telas
- 📊 3 telas completas e funcionais
- 🎨 Design Material 3 completo
