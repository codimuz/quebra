/**
 * SQLite Database Connection usando expo-sqlite
 */

import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'invent.db';

/**
 * Abrir conexão com o banco SQLite
 */
export const openDatabase = async () => {
  try {
    console.log('SQLITE: Tentando abrir banco de dados...');
    
    const db = SQLite.openDatabase(DATABASE_NAME);
    
    if (!db) {
      throw new Error('Database object é null');
    }
    
    console.log('SQLITE: Banco aberto com sucesso');
    return db;
    
  } catch (error) {
    console.error('SQLITE: Erro ao abrir:', error.message);
    throw new Error(`SQLite connection failed: ${error.message}`);
  }
};

/**
 * Habilitar debug do SQLite (não disponível no expo-sqlite, mantido para compatibilidade)
 */
export const enableDebug = () => {
  console.log('SQLITE: Debug não disponível no expo-sqlite');
};

/**
 * Fechar conexão com o banco
 * Nota: expo-sqlite gerencia automaticamente a conexão
 */
export const closeDatabase = async (db) => {
  try {
    if (db && typeof db.closeAsync === 'function') {
      await db.closeAsync();
      console.log('SQLITE: Conexão fechada com sucesso');
    }
  } catch (error) {
    console.error('SQLITE: Erro ao fechar conexão:', error);
  }
};

/**
 * Verificar se o banco está disponível
 */
export const isDatabaseReady = (db) => {
  return db !== null && db !== undefined && typeof db.transaction === 'function';
};

/**
 * Executar SQL com verificações de segurança
 */
export const executeSqlSafe = async (db, sql, params = []) => {
  try {
    if (!isDatabaseReady(db)) {
      throw new Error('Database não está pronto');
    }
    
    console.log('SQLITE: Executando SQL:', sql.substring(0, 100) + '...');
    
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          sql, 
          params,
          (_, result) => resolve([result]),
          (_, error) => reject(error)
        );
      });
    });
    
  } catch (error) {
    console.error('SQLITE: Erro ao executar SQL:', error.message);
    throw error;
  }
};

/**
 * Manager de conexão SQLite com verificações robustas
 */
class DatabaseConnection {
  constructor() {
    this.db = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      if (this.isConnected && this.db) {
        return this.db;
      }

      this.db = await openDatabase();
      
      if (!isDatabaseReady(this.db)) {
        throw new Error('Database connection failed - object not ready');
      }

      this.isConnected = true;
      console.log('SQLITE: Connection manager conectado');
      return this.db;

    } catch (error) {
      console.error('SQLITE: Connection manager falhou:', error);
      this.isConnected = false;
      this.db = null;
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.db) {
        await closeDatabase(this.db);
        this.db = null;
        this.isConnected = false;
      }
    } catch (error) {
      console.error('SQLITE: Erro ao desconectar:', error);
    }
  }

  getDatabase() {
    if (!this.isConnected || !this.db) {
      throw new Error('Database não conectado - chame connect() primeiro');
    }
    return this.db;
  }

  isReady() {
    return this.isConnected && isDatabaseReady(this.db);
  }
}

// Exportar instância singleton
export const dbConnection = new DatabaseConnection();

// Exportar funções utilitárias
export { DATABASE_NAME };