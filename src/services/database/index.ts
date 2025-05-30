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
  console.log('=== Iniciando inicialização do banco de dados ===');
  console.log('Configuração recebida:', config);

  try {
    console.log('Criando instância do DatabaseService...');
    const databaseService = new DatabaseService(config);
    
    console.log('Inicializando DatabaseService...');
    await databaseService.initialize();
    console.log('DatabaseService inicializado com sucesso');

    console.log('Criando instância do MigrationService...');
    const migrationService = new MigrationService(databaseService);
    
    console.log('Executando migrações...');
    const migrationResults = await migrationService.migrate();
    console.log('Resultados das migrações:', migrationResults);

    const failedMigrations = migrationResults.filter((r: MigrationResult) => !r.success);
    if (failedMigrations.length > 0) {
      console.error('Falha detectada nas migrações:', failedMigrations);
      throw new Error(
        `Falha ao executar migrações: ${
          failedMigrations
            .map((m: MigrationResult) => m.migrationName)
            .join(', ')
        }`
      );
    }

    console.log('Inicialização completa com sucesso');
    return databaseService;
  } catch (error) {
    console.error('=== ERRO NA INICIALIZAÇÃO ===');
    console.error('Erro original:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    
    const errorMessage = `Erro ao inicializar banco de dados: ${
      error instanceof Error ? error.message : String(error)
    }`;
    console.error('Mensagem de erro final:', errorMessage);
    
    throw new Error(errorMessage);
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
