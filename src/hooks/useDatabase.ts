import { useState, useEffect } from 'react';
import { DatabaseManager } from '../database';
import type { DatabaseConfig, DatabaseError } from '../types/database';

// Garantir que temos uma instância válida do DatabaseManager
const dbManager = DatabaseManager.getInstance();
if (!dbManager) {
  throw new Error('Falha ao inicializar o DatabaseManager');
}

// Asserção de tipo não-nulo após a verificação
const databaseManager: NonNullable<DatabaseManager> = dbManager;

export interface DatabaseHookResult {
  loading: boolean;
  error: DatabaseError | null;
  initialized: boolean;
  database: DatabaseManager | null;
}

export function useDatabase(config?: DatabaseConfig): DatabaseHookResult {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<DatabaseError | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [database, setDatabase] = useState<DatabaseManager | null>(null);

  useEffect(() => {
    async function init() {
      if (!config) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Usar a instância garantidamente não-nula
        await databaseManager.initialize();
        
        setDatabase(databaseManager);
        setInitialized(true);
      } catch (err) {
        const dbError: DatabaseError = err instanceof Error ? err : new Error(String(err));
        setError(dbError);
      } finally {
        setLoading(false);
      }
    }

    init();

    // Cleanup ao desmontar
    return () => {
      if (database) {
        database.close().catch(console.error);
      }
    };
  }, [config]);

  return {
    loading,
    error,
    initialized,
    database
  };
}