import { 
  DatabaseConfig, 
  DatabaseError, 
  TransactionCallback, 
  SqlParams,
  SQLResultSet,
  SQLResultRow,
} from '../../types/database';
import { SQLiteWrapper } from './SQLiteWrapper';

export class DatabaseService {
  private db: SQLiteWrapper;
  private config: DatabaseConfig;

  constructor(config: DatabaseConfig) {
    this.config = config;
    this.db = new SQLiteWrapper(config);
  }

  /**
   * Inicializa o banco de dados
   */
  async initialize(): Promise<void> {
    try {
      // Criar tabela de versões
      await this.db.exec(`
        CREATE TABLE IF NOT EXISTS database_versions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          version INTEGER NOT NULL UNIQUE,
          timestamp TEXT NOT NULL DEFAULT (datetime('now')),
          description TEXT NOT NULL
        );
      `);

      // Verificar versão atual
      const versionResult = await this.db.exec(
        'SELECT version FROM database_versions ORDER BY version DESC LIMIT 1'
      );

      // Inserir versão inicial se necessário
      if (versionResult.length === 0) {
        await this.db.exec(
          'INSERT INTO database_versions (version, description) VALUES (?, ?)',
          [this.config.version, this.config.description]
        );
      }
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
    try {
      const rawResult = await this.db.exec(sql, params);
      const insertId = await this.db.execScalar<number>('SELECT last_insert_rowid()');
      
      return {
        insertId: insertId || undefined,
        rowsAffected: rawResult.length,
        rows: {
          length: rawResult.length,
          item: (index: number): SQLResultRow => 
            (rawResult[index] || {}) as SQLResultRow,
          _array: rawResult
        }
      };
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
    try {
      await this.db.exec('BEGIN TRANSACTION');

      const tx = {
        executeSql: async (sql: string, params: SqlParams = []): Promise<[SQLResultSet]> => {
          const result = await this.executeSql(sql, params);
          return [result];
        }
      };

      try {
        const result = await callback(tx);
        await this.db.exec('COMMIT');
        return result;
      } catch (error) {
        await this.db.exec('ROLLBACK');
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