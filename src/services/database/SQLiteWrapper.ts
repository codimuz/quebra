import * as SQLite from 'expo-sqlite';
import { DatabaseConfig, SqlParams, SQLResultRow } from '../../types/database';

export class SQLiteWrapper {
  private db: SQLite.SQLiteDatabase;

  constructor(config: DatabaseConfig) {
    console.log('=== Início do construtor SQLiteWrapper ===');
    console.log('Config recebida:', config);
    console.log('Tipo da config:', typeof config);
    
    if (!config) {
      console.error('Config é undefined ou null');
      throw new Error('Config do banco de dados é obrigatória');
    }

    if (!config.name) {
      console.error('Nome do banco é undefined ou null na config:', config);
      throw new Error('Nome do banco de dados é obrigatório');
    }

    console.log('Validação do nome do banco:');
    console.log('- Valor:', config.name);
    console.log('- Tipo:', typeof config.name);
    console.log('- Length:', config.name.length);
    console.log('- É string vazia?', config.name === '');
    console.log('Stack trace atual:', new Error().stack);

    const dbName = config.name
      .trim()
      .replace(/[^\w.-]/g, '_')
      .replace(/^\.+|\.+$/g, '') 
      .replace(/\.db$/i, '') + '.db';

    console.log('Nome do banco normalizado:', dbName);

    try {
      console.log('Tentando abrir banco:', dbName);
      this.db = SQLite.openDatabase(dbName);
      if (!this.db) {
        throw new Error('Falha ao abrir o banco de dados');
      }
      console.log('Banco aberto com sucesso');
    } catch (error: any) {
      console.error('=== ERRO ao abrir banco ===');
      console.error('Config usada:', config);
      console.error('Erro completo:', error);
      console.error('Stack trace do erro:', error?.stack || 'Stack trace não disponível');
      throw new Error(`Erro ao abrir banco de dados: ${error?.message || 'Erro desconhecido'}`);
    }

    console.log('=== Fim do construtor SQLiteWrapper ===');
  }

  private replaceParams(sql: string, params: SqlParams): string {
    console.log('--- Início de replaceParams ---');
    console.log('Valor de sql:', sql, 'Tipo de sql:', typeof sql);
    console.log('Valor de params:', params, 'Tipo de params:', typeof params);
    console.log('Stack trace da chamada:', new Error().stack);

    if (typeof sql !== 'string' || !sql.trim()) {
      console.error('Erro DETECTADO: Query SQL inválida ou vazia recebida:', sql);
      console.error('Stack completo no momento do erro:', new Error().stack);
      throw new Error('SQL query não pode ser undefined, null ou vazia');
    }

    if (!params) {
      console.warn('Aviso: Parâmetros SQL recebidos como undefined/null, tratando como array vazio.');
      params = [];
    }

    let paramIndex = 0;
    try {
      const resultado = sql.replace(/\?/g, (match) => {
        console.log(`  Placeholder '${match}' encontrado. Index: ${paramIndex}`);

        if (paramIndex >= params.length) {
          console.error(`Erro DETECTADO: Mismatch. Placeholder '${match}' sem parâmetro correspondente. SQL: "${sql}", Parâmetros:`, params);
          throw new Error('Mismatch entre placeholders e parâmetros na query SQL.');
        }

        const param = params[paramIndex++];
        console.log(`  Parâmetro para substituir:`, param, `(Tipo: ${typeof param})`);
        
        if (param === undefined || param === null) {
          return 'NULL';
        }

        if (typeof param === 'string') {
          const escaped = param.replace(/'/g, "''");
          console.log(`  String escapada: '${escaped}'`);
          return `'${escaped}'`;
        }

        return param.toString();
      });

      console.log('Query após substituição:', resultado);
      console.log('--- Fim de replaceParams ---');
      return resultado;

    } catch (e) {
      console.error('Erro durante a substituição de parâmetros na SQL:', sql);
      console.error('Stack trace do erro na substituição:', e);
      throw e;
    }
  }

  async exec(sql: string, params: SqlParams = []): Promise<SQLResultRow[]> {
    console.log('=== Início de exec ===');
    console.log('Chamada de exec com:', { sql, params });
    console.log('Stack trace da chamada exec:', new Error().stack);

    return new Promise((resolve, reject) => {
      try {
        console.log('Preparando para chamar replaceParams...');
        const query = this.replaceParams(sql, params);
        console.log('Query após replaceParams:', query);
        
        this.db.exec([{ sql: query, args: [] }], false, (err, resultSet) => {
          if (err) {
            console.error('Erro na execução da query:', err);
            reject(err);
            return;
          }

          if (!resultSet || resultSet.length === 0) {
            resolve([]);
            return;
          }

          const rows = resultSet[0].rows as SQLResultRow[];
          console.log('Query executada com sucesso');
          resolve(rows);
        });
      } catch (error) {
        console.error('=== ERRO em exec ===');
        console.error('SQL original:', sql);
        console.error('Parâmetros:', params);
        console.error('Stack trace completo:', error);
        reject(error);
      }
    });
  }

  async execScalar<T>(sql: string, params: SqlParams = []): Promise<T | null> {
    const results = await this.exec(sql, params);
    if (!results || results.length === 0) return null;
    
    const firstRow = results[0];
    if (!firstRow) return null;

    const firstKey = Object.keys(firstRow)[0];
    if (!firstKey) return null;

    return firstRow[firstKey] as T;
  }

  async execInsert(sql: string, params: SqlParams = []): Promise<number | null> {
    try {
      await this.exec(sql, params);
      
      const result = await this.execScalar<number>('SELECT last_insert_rowid() as id');
      return result || null;
    } catch (error) {
      console.error('Erro ao executar inserção:', sql);
      console.error('Parâmetros:', params);
      console.error('Erro original na inserção:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    console.log('Fechando conexão com o banco');
  async execScalar<T>(sql: string, params: SqlParams = []): Promise<T | null> {
    const results = await this.exec(sql, params);
    if (!results || results.length === 0) return null;
    
    const firstRow = results[0];
    if (!firstRow) return null;

    const firstKey = Object.keys(firstRow)[0];
    if (!firstKey) return null;

    return firstRow[firstKey] as T;
  }

  async execInsert(sql: string, params: SqlParams = []): Promise<number | null> {
    try {
      await this.exec(sql, params);
      
      const result = await this.execScalar<number>('SELECT last_insert_rowid() as id');
      return result || null;
    } catch (error) {
      console.error('Erro ao executar inserção:', sql);
      console.error('Parâmetros:', params);
      console.error('Erro original na inserção:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    console.log('Fechando conexão com o banco');
    if (this.db && typeof this.db.closeAsync === 'function') {
      await this.db.closeAsync();
    }
  }
}
