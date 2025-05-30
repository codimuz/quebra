import { DatabaseConfig } from '../services/database';

/**
 * Configuração do banco de dados por ambiente
 */
const databaseConfig: Record<string, DatabaseConfig> = {
  development: {
    name: 'motivos_dev.db',
    version: 1,
    description: 'Banco de dados de desenvolvimento do aplicativo Motivos'
  },
  production: {
    name: 'motivos.db',
    version: 1,
    description: 'Banco de dados do aplicativo Motivos'
  },
  test: {
    name: 'motivos_test.db',
    version: 1,
    description: 'Banco de dados de teste do aplicativo Motivos'
  }
};

/**
 * Ambiente atual (development, production, test)
 */
const ENV = __DEV__ ? 'development' : 'production';

/**
 * Configuração do banco de dados para o ambiente atual
 */
export const DB_CONFIG = databaseConfig[ENV];

/**
 * Versões das migrações disponíveis
 */
export const MIGRATION_VERSIONS = {
  INITIAL: 1,
  // Adicionar novas versões aqui
} as const;

/**
 * Configurações para backup do banco de dados
 */
export const BACKUP_CONFIG = {
  /**
   * Diretório para armazenar os backups
   */
  directory: 'backups',

  /**
   * Número máximo de backups para manter
   */
  maxBackups: 5,

  /**
   * Intervalo de backup automático em minutos
   * (0 para desativar backup automático)
   */
  autoBackupInterval: __DEV__ ? 0 : 60,

  /**
   * Realizar backup antes de executar migrações
   */
  backupBeforeMigration: true
};

/**
 * Configurações de logs do banco de dados
 */
export const DB_LOGS = {
  /**
   * Habilitar logs de queries
   */
  enableQueryLogging: __DEV__,

  /**
   * Habilitar logs de performance
   */
  enablePerformanceLogging: __DEV__,

  /**
   * Limite de tempo em ms para considerar uma query como lenta
   */
  slowQueryThreshold: 100
};