export interface DatabaseConfig {
  name: string;
  version: number;
  description: string;
}

export interface MigrationResult {
  success: boolean;
  error?: Error;
  migrationName: string;
  version: number;
  executedAt: string;
}

export interface DatabaseVersion {
  version: number;
  timestamp: string;
  description: string;
}

export interface Migration {
  name: string;
  version: number;
  description: string;
  up: (transaction: SQLTransactionExecutor) => Promise<void>;
  down: (transaction: SQLTransactionExecutor) => Promise<void>;
}

export type SqlParams = (number | string | null)[];

export interface DatabaseError extends Error {
  code?: string;
  sqlError?: Error;
}

export interface SQLResultRow {
  [key: string]: any;
}

export interface SQLResultSet {
  insertId?: number;
  rowsAffected: number;
  rows: {
    length: number;
    item: (index: number) => SQLResultRow;
    _array: SQLResultRow[];
  };
}

export interface SQLTransactionExecutor {
  executeSql: (
    sqlStatement: string,
    params?: SqlParams
  ) => Promise<[SQLResultSet]>;
}

export type TransactionCallback<T> = (
  transaction: SQLTransactionExecutor
) => Promise<T>;

export interface QueryResult<T = SQLResultRow> extends Array<T> {
  insertId?: number;
  rowsAffected?: number;
}