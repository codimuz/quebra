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
  console.log('=== DatabaseProvider inicializando ===');
  console.log('Config recebida:', config);

  try {
    const databaseHook = useDatabase(config);
    console.log('Estado do Database Hook:', {
      loading: databaseHook.loading,
      error: databaseHook.error,
      initialized: databaseHook.initialized,
      hasDatabase: !!databaseHook.database,
      hasMigrations: !!databaseHook.migrations
    });

    return (
      <DatabaseContext.Provider value={databaseHook}>
        {children}
      </DatabaseContext.Provider>
    );
  } catch (error) {
    console.error('=== ERRO NO PROVIDER ===');
    console.error('Erro:', error);
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack');
    throw error;
  }
}

/**
 * Hook para usar o contexto de banco de dados
 */
export function useDataBaseContext(): DatabaseHookResult {
  console.log('=== useDataBaseContext chamado ===');
  const context = useContext(DatabaseContext);
  
  if (!context) {
    console.error('Contexto não encontrado no useDataBaseContext');
    throw new Error(
      'useDataBaseContext deve ser usado dentro de um DatabaseProvider'
    );
  }

  console.log('Estado atual do contexto:', {
    loading: context.loading,
    error: context.error,
    initialized: context.initialized,
    hasDatabase: !!context.database,
    hasMigrations: !!context.migrations
  });

  if (context.database) {
    console.log('Database instance presente no contexto');
  } else {
    console.warn('Database instance ausente no contexto');
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
