import { DatabaseService } from './DatabaseService';
import { MigrationService } from './MigrationService';
import type { 
  DatabaseConfig, 
  DatabaseError,
  DatabaseVersion,
  Migration,
  MigrationResult,
  QueryResult,
  SQLResultRow,
  SQLResultSet,
  SQLTransactionExecutor,
  SqlParams,
  TransactionCallback
} from '../../types/database';
import { migrations } from './migrations';

/**
 * Inicializa o banco de dados e executa as migrações pendentes
 */
export async function initializeDatabase(config: DatabaseConfig) {
  try {
    // Criar instância do banco de dados
    const databaseService = new DatabaseService(config);
    await databaseService.initialize();

    // Executar migrações
    const migrationResults = await new MigrationService(databaseService).migrate();

    // Verificar se houve falha em alguma migração
    const failedMigrations = migrationResults.filter((r: MigrationResult) => !r.success);
    if (failedMigrations.length > 0) {
      throw new Error(
        `Falha ao executar migrações: ${
          failedMigrations
            .map((m: MigrationResult) => m.migrationName)
            .join(', ')
        }`
      );
    }

    return databaseService;
  } catch (error) {
    throw new Error(
      `Erro ao inicializar banco de dados: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

// Re-exportar classes principais
export { DatabaseService } from './DatabaseService';
export { MigrationService } from './MigrationService';
export { migrations };

// Re-exportar tipos
export type {
  DatabaseConfig,
  DatabaseError,
  DatabaseVersion,
  Migration,
  MigrationResult,
  QueryResult,
  SQLResultRow,
  SQLResultSet,
  SQLTransactionExecutor,
  SqlParams,
  TransactionCallback
};

// Tipo para serviços do banco de dados
export interface DatabaseServices {
  database: DatabaseService;
  migrations: MigrationService;
}