import * as SQLite from 'expo-sqlite';
import { DatabaseConfig, SqlParams, SQLResultRow } from '../../types/database';

export class SQLiteWrapper {
  private db: SQLite.SQLiteDatabase;

  constructor(config: DatabaseConfig) {
    if (!config.name) {
      throw new Error('Nome do banco de dados é obrigatório');
    }
    this.db = SQLite.openDatabaseSync(config.name);
  }

  /**
   * Substitui os parâmetros na query de forma segura
   */
  private replaceParams(sql: string, params: SqlParams): string {
    if (!params.length) return sql;

    return sql.replace(/\?/g, (match, index) => {
      const param = params[index];
      if (param === null) return 'NULL';
      if (typeof param === 'string') return `'${param.replace(/'/g, "''")}'`;
      return param.toString();
    });
  }

  /**
   * Executa uma query SQL e retorna os resultados
   */
  async exec(sql: string, params: SqlParams = []): Promise<SQLResultRow[]> {
    try {
      // Preparar a query com os parâmetros
      const query = this.replaceParams(sql, params);
      
      // Se for uma query SELECT, executar e retornar resultados
      if (sql.trim().toLowerCase().startsWith('select')) {
        const result = await this.db.execAsync(query) as unknown as SQLResultRow[];
        return result || [];
      }
      
      // Para outras queries (INSERT, UPDATE, DELETE), apenas executar
      await this.db.execAsync(query);
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
    try {
      // Executar a inserção
      await this.exec(sql, params);
      
      // Obter o ID do último registro inserido
      const lastIdQuery = 'SELECT last_insert_rowid() as id';
      const result = await this.db.execAsync(lastIdQuery) as unknown as Array<{id: number}>;
      
      return result?.[0]?.id || null;
    } catch (error) {
      console.error('Erro ao executar inserção:', sql);
      console.error('Parâmetros:', params);
      console.error('Erro:', error);
      throw error;
    }
  }

  /**
   * Fecha a conexão com o banco de dados
   */
  async close(): Promise<void> {
    if (this.db && typeof this.db.closeAsync === 'function') {
      await this.db.closeAsync();
    }
  }
}