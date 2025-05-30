# Plano de Migração do Banco de Dados

## Contexto

Atualmente, o projeto possui duas implementações de banco de dados:

1. Em `src/services/database` (TypeScript):
   - Implementação mais moderna
   - Sistema de migrações
   - Tipagem forte
   - Testes automatizados

2. Em `src/database` (JavaScript):
   - Implementação mais antiga
   - DAOs específicos para o negócio
   - Padrão Singleton
   - Funcionalidades específicas para produtos e motivos

## Plano de Ação

### 1. Remoção do Diretório Antigo
Remover completamente o diretório `src/services/database` e todo seu conteúdo.

### 2. Adaptação dos Arquivos que Importam da Estrutura Antiga

#### Arquivos a serem atualizados:

1. `src/hooks/useDatabase.ts`:
   - Remover importações de `../services/database`
   - Usar o `DatabaseManager` de `../database`
   - Adaptar tipos e interfaces

2. `src/contexts/DatabaseContext.tsx`:
   - Atualizar importação de `DatabaseConfig`
   - Adaptar para usar nova estrutura

3. `src/config/database.ts`:
   - Atualizar importação de `DatabaseConfig`
   - Adaptar configurações se necessário

### 3. Estrutura Final

```
src/database/
├── dao/
│   ├── EntryDAO.js
│   ├── ProductDAO.js
│   └── ReasonDAO.js
├── connection.js
├── db.js
├── expo-connection.js
├── expo-manager.js
├── fallback.js
├── index.js
├── schema.js
└── simple-connection.js
```

## Próximos Passos

1. Trocar para o modo Code para implementar as alterações
2. Atualizar as importações nos arquivos afetados
3. Remover o diretório `src/services/database`
4. Testar funcionalidades para garantir que tudo continua funcionando

## Impacto

- Menor complexidade no código
- Remoção de código duplicado
- Manutenção mais simples
- Estrutura mais coesa

## Riscos e Mitigações

### Riscos
1. Perda de funcionalidades do sistema de migrações
2. Perda de tipagem forte
3. Possíveis bugs durante a transição

### Mitigações
1. Testar extensivamente após as mudanças
2. Documentar mudanças necessárias nos arquivos de configuração
3. Implementar gradualmente caso necessário