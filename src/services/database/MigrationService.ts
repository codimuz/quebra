import { DatabaseService } from './DatabaseService';
import { migrations, latestVersion } from './migrations';
import { 
  Migration,
  MigrationResult,
  DatabaseError,
  SQLTransactionExecutor 
} from '../../types/database';

export class MigrationService {
  constructor(private db: DatabaseService) {}

  /**
   * Executa as migrações pendentes até a versão mais recente
   */
  async migrate(): Promise<MigrationResult[]> {
    const results: MigrationResult[] = [];

    try {
      // Obter a versão atual do banco
      const currentVersion = await this.getCurrentVersion();
      
      // Se a versão atual é a mais recente, não há nada para migrar
      if (currentVersion === latestVersion) {
        return results;
      }

      // Executar as migrações pendentes em ordem
      await this.db.transaction(async (transaction) => {
        for (const migration of migrations) {
          if (migration.version > currentVersion) {
            const result = await this.executeMigration(migration, transaction);
            results.push(result);
          }
        }
      });

      return results;
    } catch (error) {
      throw this.createDatabaseError(
        'Erro ao executar migrações',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * Reverte todas as migrações até uma versão específica
   */
  async rollback(targetVersion: number): Promise<MigrationResult[]> {
    const results: MigrationResult[] = [];

    try {
      // Obter a versão atual do banco
      const currentVersion = await this.getCurrentVersion();
      
      // Se a versão atual é menor ou igual à versão alvo, não há nada para reverter
      if (currentVersion <= targetVersion) {
        return results;
      }

      // Executar as reversões em ordem decrescente
      await this.db.transaction(async (transaction) => {
        const reverseMigrations = migrations
          .filter(m => m.version > targetVersion && m.version <= currentVersion)
          .sort((a, b) => b.version - a.version);

        for (const migration of reverseMigrations) {
          const result = await this.executeRollback(migration, transaction);
          results.push(result);
        }
      });

      return results;
    } catch (error) {
      throw this.createDatabaseError(
        'Erro ao reverter migrações',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * Obtém a versão atual do banco de dados
   */
  private async getCurrentVersion(): Promise<number> {
    const result = await this.db.executeSql(
      'SELECT version FROM database_versions ORDER BY version DESC LIMIT 1'
    );

    return result.rows.length > 0 ? result.rows.item(0).version : 0;
  }

  /**
   * Executa uma migração específica
   */
  private async executeMigration(
    migration: Migration,
    transaction: SQLTransactionExecutor
  ): Promise<MigrationResult> {
    try {
      await migration.up(transaction);

      await transaction.executeSql(
        `INSERT INTO database_versions (version, description) VALUES (?, ?)`,
        [migration.version, migration.description]
      );

      return {
        success: true,
        migrationName: migration.name,
        version: migration.version,
        executedAt: new Date().toISOString()
      };
    } catch (error) {
      const migrationError = error instanceof Error ? error : new Error(String(error));
      const result: MigrationResult = {
        success: false,
        error: migrationError,
        migrationName: migration.name,
        version: migration.version,
        executedAt: new Date().toISOString()
      };

      throw this.createDatabaseError(
        `Erro ao executar migração ${migration.name}`,
        migrationError,
        result
      );
    }
  }

  /**
   * Executa o rollback de uma migração específica
   */
  private async executeRollback(
    migration: Migration,
    transaction: SQLTransactionExecutor
  ): Promise<MigrationResult> {
    try {
      await migration.down(transaction);

      await transaction.executeSql(
        `DELETE FROM database_versions WHERE version = ?`,
        [migration.version]
      );

      return {
        success: true,
        migrationName: migration.name,
        version: migration.version,
        executedAt: new Date().toISOString()
      };
    } catch (error) {
      const migrationError = error instanceof Error ? error : new Error(String(error));
      const result: MigrationResult = {
        success: false,
        error: migrationError,
        migrationName: migration.name,
        version: migration.version,
        executedAt: new Date().toISOString()
      };

      throw this.createDatabaseError(
        `Erro ao reverter migração ${migration.name}`,
        migrationError,
        result
      );
    }
  }

  /**
   * Cria um erro de migração padronizado
   */
  private createDatabaseError(
    message: string,
    originalError: Error,
    result?: MigrationResult
  ): DatabaseError {
    const error = new Error(message) as DatabaseError;
    error.name = 'MigrationError';
    error.code = 'MIGRATION_ERROR';
    error.sqlError = originalError;
    error.stack = originalError.stack;

    if (result) {
      Object.assign(error, { migrationResult: result });
    }

    return error;
  }
}