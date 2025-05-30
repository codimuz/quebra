import { 
  DatabaseConfig, 
  DatabaseError, 
  TransactionCallback, 
  SqlParams,
  SQLResultSet,
  SQLResultRow,
} from '../../types/database';
import { SQLiteWrapper } from './SQLiteWrapper';
import { MigrationService } from './MigrationService';

export class DatabaseService {
  private db: SQLiteWrapper;
  private config: DatabaseConfig;
  private migrationService: MigrationService;

  constructor(config: DatabaseConfig) {
    this.config = config;
    this.db = new SQLiteWrapper(config);
    this.migrationService = new MigrationService(this);
  }

  /**
   * Inicializa o banco de dados
   */
  async initialize(): Promise<void> {
    try {
      // Executa as migrações pendentes
      await this.migrationService.migrate();
    } catch (error) {
      throw this.createDatabaseError(
        'Erro ao inicializar banco de dados',
        'INIT_ERROR',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * Executa uma query SQL com parâmetros
   */
  async executeSql(
    sql: string,
    params: SqlParams = []
  ): Promise<SQLResultSet> {
    console.log('=== DatabaseService.executeSql ===');
    console.log('SQL recebido:', sql);
    console.log('Parâmetros recebidos:', params);
    console.log('Tipo de SQL:', typeof sql);
    console.log('Stack trace da chamada:', new Error().stack);

    if (!sql) {
      console.error('SQL undefined/empty em DatabaseService.executeSql');
      throw this.createDatabaseError(
        'SQL query não pode ser undefined ou vazia',
        'INVALID_SQL',
        new Error('SQL undefined ou vazio')
      );
    }

    try {
      console.log('Chamando this.db.exec...');
      const rawResult = await this.db.exec(sql, params);
      console.log('Resultado do exec:', rawResult);

      console.log('Obtendo último ID inserido...');
      const insertId = await this.db.execScalar<number>('SELECT last_insert_rowid()');
      console.log('ID inserido:', insertId);
      
      const resultSet = {
        insertId: insertId || undefined,
        rowsAffected: rawResult.length,
        rows: {
          length: rawResult.length,
          item: (index: number): SQLResultRow => 
            (rawResult[index] || {}) as SQLResultRow,
          _array: rawResult
        }
      };

      console.log('ResultSet montado:', resultSet);
      console.log('=== Fim DatabaseService.executeSql ===');
      return resultSet;
    } catch (error) {
      throw this.createDatabaseError(
        'Erro ao executar SQL',
        'SQL_ERROR',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * Executa uma transação no banco de dados
   */
  async transaction<T>(callback: TransactionCallback<T>): Promise<T> {
    console.log('=== Iniciando transação ===');
    try {
      console.log('Executando BEGIN TRANSACTION...');
      await this.db.exec('BEGIN TRANSACTION');

      const tx = {
        executeSql: async (sql: string, params: SqlParams = []): Promise<[SQLResultSet]> => {
          console.log('Executando SQL na transação:', sql);
          console.log('Parâmetros da transação:', params);
          const result = await this.executeSql(sql, params);
          return [result];
        }
      };

      try {
        console.log('Executando callback da transação...');
        const result = await callback(tx);
        console.log('Executando COMMIT...');
        await this.db.exec('COMMIT');
        console.log('Transação concluída com sucesso');
        return result;
      } catch (error) {
        console.error('Erro na transação, executando ROLLBACK...');
        await this.db.exec('ROLLBACK');
        console.error('ROLLBACK concluído, propagando erro:', error);
        throw error;
      }
    } catch (error) {
      throw this.createDatabaseError(
        'Erro durante transação',
        'TRANSACTION_ERROR',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * Fecha a conexão com o banco de dados
   */
  async close(): Promise<void> {
    try {
      await this.db.close();
    } catch (error) {
      throw this.createDatabaseError(
        'Erro ao fechar banco de dados',
        'CLOSE_ERROR',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * Cria um erro padronizado do banco de dados
   */
  private createDatabaseError(
    message: string,
    code: string,
    originalError: Error
  ): DatabaseError {
    const error = new Error(message) as DatabaseError;
    error.name = 'DatabaseError';
    error.code = code;
    error.sqlError = originalError;
    error.stack = originalError.stack;
    return error;
  }
}
