import * as SQLite from 'expo-sqlite';
import { DatabaseConfig } from '../../types/database';
import { SqlParams } from '../../types/database';

export class SQLiteWrapper {
  private db: SQLite.SQLiteDatabase;

  constructor(config: DatabaseConfig) {
    if (!config.name) {
      throw new Error('Nome do banco de dados é obrigatório');
    }
    console.log('=== Início do construtor SQLiteWrapper ===');
    console.log('Config recebida:', config);
    console.log('Tipo da config:', typeof config);
    console.log('Validação do nome do banco:');
    console.log('- Valor:', config.name);
    console.log('- Tipo:', typeof config.name);
    console.log('- Length:', config.name.length);
    console.log('- É string vazia?', config.name.trim() === '');
    console.log('Stack trace atual:', new Error().stack);

    const normalizedName = String(config.name).trim();
    console.log('Nome do banco normalizado:', normalizedName);
    console.log('Tentando abrir banco:', normalizedName);

    try {
      this.db = SQLite.openDatabaseSync(normalizedName);
    } catch (error) {
      console.error('=== ERRO ao abrir banco ===');
      console.error('Config usada:', config);
      console.error('Erro completo:', error);
      console.error('Stack trace do erro:', error instanceof Error ? error.stack : 'No stack trace');
      throw new Error(`Erro ao abrir banco de dados: ${error}`);
    }
  }

  async exec(sql: string, params: SqlParams = []): Promise<any[]> {
    try {
      const result = await this.db.getAllAsync(sql, params);
      return result;
    } catch (error) {
      console.error('Erro ao executar SQL:', sql);
      console.error('Parâmetros:', params);
      console.error('Erro:', error);
      throw error;
    }
  }

  async execScalar<T>(sql: string, params: SqlParams = []): Promise<T | null> {
    try {
      const result = await this.db.getFirstAsync<T>(sql, params);
      return result;
    } catch (error) {
      console.error('Erro ao executar SQL scalar:', sql);
      console.error('Parâmetros:', params);
      console.error('Erro:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    console.log('Fechando conexão com o banco');
    await this.db.closeAsync();
  }
}
