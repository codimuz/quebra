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
      console.log('MigrationService: Iniciando processo de migração');
      
      // Obter a versão atual do banco
      console.log('MigrationService: Verificando versão atual do banco...');
      const currentVersion = await this.getCurrentVersion();
      console.log(`MigrationService: Versão atual do banco: ${currentVersion}`);
      console.log(`MigrationService: Última versão disponível: ${latestVersion}`);
      
      // Se a versão atual é a mais recente, não há nada para migrar
      if (currentVersion === latestVersion) {
        console.log('MigrationService: Banco já está na versão mais recente');
        return results;
      }

      // Executar as migrações pendentes em ordem
      console.log('MigrationService.migrate: Iniciando transação para migrações...');
      await this.db.transaction(async (transaction) => {
        for (const migration of migrations) {
          if (migration.version > currentVersion) {
            console.log(`MigrationService.migrate: Processando migração ${migration.name}...`);
            const result = await this.executeMigration(migration, transaction);
            console.log(`MigrationService.migrate: Migração ${migration.name} concluída com sucesso`);
            results.push(result);
          } else {
            console.log(`MigrationService.migrate: Pulando migração ${migration.name} (versão ${migration.version} <= ${currentVersion})`);
          }
        }
      });
      console.log('MigrationService.migrate: Todas as migrações foram processadas com sucesso');

      return results;
    } catch (error) {
      console.error('MigrationService.migrate: Erro durante o processo de migração:', error);
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
      console.log(`MigrationService.rollback: Iniciando rollback para versão ${targetVersion}`);
      
      // Obter a versão atual do banco
      console.log('MigrationService.rollback: Verificando versão atual do banco');
      const currentVersion = await this.getCurrentVersion();
      console.log(`MigrationService.rollback: Versão atual: ${currentVersion}`);
      
      // Se a versão atual é menor ou igual à versão alvo, não há nada para reverter
      if (currentVersion <= targetVersion) {
        console.log('MigrationService.rollback: Nada para reverter, versão atual já é menor ou igual à versão alvo');
        return results;
      }

      // Executar as reversões em ordem decrescente
      console.log('MigrationService.rollback: Iniciando transação para reversões');
      await this.db.transaction(async (transaction) => {
        const reverseMigrations = migrations
          .filter(m => m.version > targetVersion && m.version <= currentVersion)
          .sort((a, b) => b.version - a.version);

        console.log(`MigrationService.rollback: ${reverseMigrations.length} migrações serão revertidas`);
        
        for (const migration of reverseMigrations) {
          console.log(`MigrationService.rollback: Revertendo migração ${migration.name}...`);
          const result = await this.executeRollback(migration, transaction);
          console.log(`MigrationService.rollback: Migração ${migration.name} revertida com sucesso`);
          results.push(result);
        }
      });
      console.log('MigrationService.rollback: Todas as reversões foram concluídas com sucesso');

      return results;
    } catch (error) {
      console.error('MigrationService.rollback: Erro durante processo de reversão:', error);
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
    try {
      console.log('MigrationService.getCurrentVersion: Consultando tabela database_versions');
      const result = await this.db.executeSql(
        'SELECT version FROM database_versions ORDER BY version DESC LIMIT 1'
      );
      console.log('MigrationService.getCurrentVersion: Resultado da consulta:', result.rows._array);

      if (result.rows.length === 0) {
        console.log('MigrationService.getCurrentVersion: Nenhuma versão encontrada, retornando 0');
        return 0;
      }

      const version = result.rows.item(0).version;
      console.log(`MigrationService.getCurrentVersion: Versão atual do banco: ${version}`);
      return version;
    } catch (error) {
      console.error('MigrationService.getCurrentVersion: Erro ao consultar versão:', error);
      console.log('MigrationService.getCurrentVersion: Retornando versão 0 devido ao erro');
      return 0;
    }
  }

  /**
   * Executa uma migração específica
   */
  private async executeMigration(
    migration: Migration,
    transaction: SQLTransactionExecutor
  ): Promise<MigrationResult> {
    try {
      console.log(`MigrationService.executeMigration: Iniciando migração ${migration.name} (versão ${migration.version})`);
      
      console.log('MigrationService.executeMigration: Executando up()...');
      await migration.up(transaction);
      console.log('MigrationService.executeMigration: up() executado com sucesso');

      console.log('MigrationService.executeMigration: Registrando versão no banco...');
      await transaction.executeSql(
        `INSERT INTO database_versions (version, description) VALUES (?, ?)`,
        [migration.version, migration.description]
      );
      console.log('MigrationService.executeMigration: Versão registrada com sucesso');

      const result = {
        success: true,
        migrationName: migration.name,
        version: migration.version,
        executedAt: new Date().toISOString()
      };
      console.log('MigrationService.executeMigration: Migração concluída:', result);
      return result;
    } catch (error) {
      console.error(`MigrationService.executeMigration: Erro na migração ${migration.name}:`, error);
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
      console.log(`MigrationService.executeRollback: Iniciando rollback da migração ${migration.name} (versão ${migration.version})`);
      
      console.log('MigrationService.executeRollback: Executando down()...');
      await migration.down(transaction);
      console.log('MigrationService.executeRollback: down() executado com sucesso');

      console.log('MigrationService.executeRollback: Removendo registro da versão do banco...');
      await transaction.executeSql(
        `DELETE FROM database_versions WHERE version = ?`,
        [migration.version]
      );
      console.log('MigrationService.executeRollback: Registro da versão removido com sucesso');

      const result = {
        success: true,
        migrationName: migration.name,
        version: migration.version,
        executedAt: new Date().toISOString()
      };
      console.log('MigrationService.executeRollback: Rollback concluído:', result);
      return result;
    } catch (error) {
      console.error(`MigrationService.executeRollback: Erro no rollback da migração ${migration.name}:`, error);
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
