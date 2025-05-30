import { SQLTransactionExecutor } from '../../../types/database';

export const migrationName = '001_initial_schema';
export const version = 1;

export async function up(transaction: SQLTransactionExecutor): Promise<void> {
  // Tabela de produtos
  await transaction.executeSql(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT,
      brand TEXT,
      regular_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      unit_type TEXT NOT NULL DEFAULT 'UN'
        CHECK (unit_type IN ('KG', 'UN', 'L', 'M2', 'M3')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      deleted_at TEXT
    );
  `);

  // Índices para otimização
  await transaction.executeSql(
    'CREATE INDEX IF NOT EXISTS idx_products_code ON products(product_code);'
  );
  
  await transaction.executeSql(
    'CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);'
  );
  
  await transaction.executeSql(
    'CREATE INDEX IF NOT EXISTS idx_products_deleted ON products(deleted_at);'
  );

  // Trigger para atualizar o updated_at
  await transaction.executeSql(`
    CREATE TRIGGER IF NOT EXISTS update_products_timestamp 
    AFTER UPDATE ON products
    BEGIN
      UPDATE products 
      SET updated_at = datetime('now')
      WHERE id = NEW.id;
    END;
  `);
}

export async function down(transaction: SQLTransactionExecutor): Promise<void> {
  // Remover triggers
  await transaction.executeSql('DROP TRIGGER IF EXISTS update_products_timestamp;');
  
  // Remover índices
  await transaction.executeSql('DROP INDEX IF EXISTS idx_products_code;');
  await transaction.executeSql('DROP INDEX IF EXISTS idx_products_name;');
  await transaction.executeSql('DROP INDEX IF EXISTS idx_products_deleted;');
  
  // Remover tabela
  await transaction.executeSql('DROP TABLE IF EXISTS products;');
}

export const description = 'Criação da estrutura inicial do banco de dados';