import { useState, useEffect } from 'react';
import { 
  DatabaseConnection,
  initDatabase,
  DatabaseInstance
} from '../database';
import { DatabaseConfig } from '../types/database';

export interface DatabaseHookResult {
  loading: boolean;
  error: Error | null;
  initialized: boolean;
  database: DatabaseInstance | null;
}

export function useDatabase(config?: DatabaseConfig): DatabaseHookResult {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [database, setDatabase] = useState<DatabaseInstance | null>(null);

  useEffect(() => {
    async function init() {
      if (!config) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Inicializar banco de dados
        const db = await DatabaseConnection.initialize(config);
        await initDatabase(db);
        
        setDatabase(db);
        setInitialized(true);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
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