import * as SQLite from 'expo-sqlite';
import { DatabaseConfig, SqlParams, SQLResultRow } from '../../types/database';

export class SQLiteWrapper {
  private db: SQLite.SQLiteDatabase;

  constructor(config: DatabaseConfig) {
    if (!config.name) {
      throw new Error('Nome do banco de dados é obrigatório');
    }
    console.log('Inicializando SQLiteWrapper com banco:', config.name);
    this.db = SQLite.openDatabaseSync(config.name);
  }

  /**
   * Substitui os parâmetros na query de forma segura
   */
  private replaceParams(sql: string, params: SqlParams): string {
    if (!sql) {
      throw new Error('SQL query não pode ser undefined/null');
    }

    if (!params || !params.length) return sql;

    console.log('Substituindo parâmetros na query:', { sql, params });

    let paramIndex = 0;
    return sql.replace(/\?/g, () => {
      const param = params[paramIndex++];
      
      // Tratar undefined/null explicitamente
      if (param === undefined || param === null) {
        return 'NULL';
      }

      // Tratar strings com escape adequado
      if (typeof param === 'string') {
        return `'${param.replace(/'/g, "''")}'`;
      }

      // Outros tipos são convertidos para string
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
      console.log('Executando query:', query);
      
      // Se for uma query SELECT, executar e retornar resultados
      if (sql.trim().toLowerCase().startsWith('select')) {
        const result = await this.db.execAsync(query) as unknown as SQLResultRow[];
        console.log('Resultado SELECT:', result);
        return result || [];
      }
      
      // Para outras queries (INSERT, UPDATE, DELETE), apenas executar
      console.log('Executando query não-SELECT');
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
    if (!results || results.length === 0) return null;
    
    const firstRow = results[0];
    if (!firstRow) return null;

    const firstKey = Object.keys(firstRow)[0];
    if (!firstKey) return null;

    return firstRow[firstKey] as T;
  }

  /**
   * Executa uma query de inserção e retorna o ID inserido
   */
  async execInsert(sql: string, params: SqlParams = []): Promise<number | null> {
    try {
      // Executar a inserção
      console.log('Executando inserção:', { sql, params });
      await this.exec(sql, params);
      
      // Obter o ID do último registro inserido
      const lastIdQuery = 'SELECT last_insert_rowid() as id';
      console.log('Obtendo último ID inserido');
      const result = await this.db.execAsync(lastIdQuery) as unknown as Array<{id: number}>;
      
      const insertedId = result?.[0]?.id || null;
      console.log('ID inserido:', insertedId);
      return insertedId;
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
    console.log('Fechando conexão com o banco');
    if (this.db && typeof this.db.closeAsync === 'function') {
      await this.db.closeAsync();
    }
  }
}