import { useState, useEffect } from 'react';
import { 
  DatabaseService,
  DatabaseServices,
  DatabaseConfig, 
  MigrationService,
  initializeDatabase 
} from '../services/database';

export interface DatabaseHookResult {
  loading: boolean;
  error: Error | null;
  initialized: boolean;
  database: DatabaseService | null;
  migrations: MigrationService | null;
}

export function useDatabase(config?: DatabaseConfig): DatabaseHookResult {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [services, setServices] = useState<DatabaseServices | null>(null);

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
        const database = await initializeDatabase(config);
        
        // Criar serviços
        const dbServices: DatabaseServices = {
          database,
          migrations: new MigrationService(database)
        };

        setServices(dbServices);
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
      if (services?.database) {
        services.database.close().catch(console.error);
      }
    };
  }, [config]);

  return {
    loading,
    error,
    initialized,
    database: services?.database || null,
    migrations: services?.migrations || null
  };
}