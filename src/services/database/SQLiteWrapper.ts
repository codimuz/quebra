import * as SQLite from 'expo-sqlite';
import { DatabaseConfig, SqlParams, SQLResultRow } from '../../types/database';

export class SQLiteWrapper {
  private db: SQLite.SQLiteDatabase;

  constructor(config: DatabaseConfig) {
    this.db = SQLite.openDatabaseSync(config.name);
  }

  /**
   * Executa uma query SQL e retorna os resultados
   */
  async exec(sql: string, params: SqlParams = []): Promise<SQLResultRow[]> {
    try {
      // Substituir os parâmetros na query manualmente
      const query = sql.replace(/\?/g, (_, i) => {
        const param = params[i];
        if (param === null) return 'NULL';
        if (typeof param === 'string') return `'${param.replace(/'/g, "''")}'`;
        return param.toString();
      });

      // Executar a query usando o método nativo
      const result = await this.db.execAsync(query) as unknown;
      
      // Se o resultado for um array, retorná-lo
      if (Array.isArray(result)) {
        return result as SQLResultRow[];
      }

      // Se não houver resultado, retornar array vazio
      return [];
    } catch (error) {
      console.error('Erro ao executar SQL:', sql);
      console.error('Parâmetros:', params);
      console.error('Erro:', error);
      throw error;
    }
  }

  /**
   * Executa uma única query que deve retornar um único resultado
   */
  async execScalar<T>(sql: string, params: SqlParams = []): Promise<T | null> {
    const results = await this.exec(sql, params);
    if (results.length === 0) return null;
    
    const firstRow = results[0];
    const firstKey = Object.keys(firstRow)[0];
    return firstRow[firstKey] as T;
  }

  /**
   * Executa uma query de inserção e retorna o ID inserido
   */
  async execInsert(sql: string, params: SqlParams = []): Promise<number | null> {
    await this.exec(sql, params);
    return this.execScalar<number>('SELECT last_insert_rowid()');
  }

  /**
   * Fecha a conexão com o banco de dados
   */
  async close(): Promise<void> {
    await this.db.closeAsync();
  }
}