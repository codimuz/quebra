import React, { createContext, useContext, ReactNode } from 'react';
import { useDatabase, DatabaseHookResult } from '../hooks/useDatabase';
import { DatabaseConfig } from '../services/database';

// Contexto
const DatabaseContext = createContext<DatabaseHookResult | null>(null);

// Props do provedor
interface DatabaseProviderProps {
  children: ReactNode;
  config?: DatabaseConfig;
}

/**
 * Provedor do contexto de banco de dados
 */
export function DatabaseProvider({ children, config }: DatabaseProviderProps) {
  const databaseHook = useDatabase(config);

  return (
    <DatabaseContext.Provider value={databaseHook}>
      {children}
    </DatabaseContext.Provider>
  );
}

/**
 * Hook para usar o contexto de banco de dados
 */
export function useDataBaseContext(): DatabaseHookResult {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error(
      'useDataBaseContext deve ser usado dentro de um DatabaseProvider'
    );
  }
  return context;
}

/**
 * HOC para garantir que o banco de dados está inicializado
 */
export function withDatabase<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function DatabaseComponent(props: P) {
    const { loading, error, initialized } = useDataBaseContext();

    if (loading) {
      return <div>Carregando banco de dados...</div>;
    }

    if (error) {
      return (
        <div>
          <h3>Erro ao inicializar banco de dados</h3>
          <pre>{error.message}</pre>
        </div>
      );
    }

    if (!initialized) {
      return <div>Banco de dados não inicializado</div>;
    }

    return <WrappedComponent {...props} />;
  };
}

// Re-exportar tipos importantes
export type { DatabaseConfig } from '../services/database';
export type { DatabaseHookResult } from '../hooks/useDatabase';