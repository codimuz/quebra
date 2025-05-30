import { SQLiteWrapper } from '../SQLiteWrapper';
import { DatabaseConfig } from '../../../types/database';

declare global {
  var __mockExecAsync: jest.Mock;
  var __mockCloseAsync: jest.Mock;
  var __mockOpenDatabaseSync: jest.Mock;
  var __mockDb: {
    execAsync: jest.Mock;
    closeAsync: jest.Mock;
  };
}

describe('SQLiteWrapper', () => {
  let wrapper: SQLiteWrapper;
  const config: DatabaseConfig = {
    name: 'test.db',
    version: 1,
    description: 'Test database'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    wrapper = new SQLiteWrapper(config);
  });

  describe('constructor', () => {
    test('deve criar uma instância com configuração válida', () => {
      expect(wrapper).toBeInstanceOf(SQLiteWrapper);
      expect(global.__mockOpenDatabaseSync).toHaveBeenCalledWith('test.db');
    });

    test('deve lançar erro se nome do banco não for fornecido', () => {
      expect(() => new SQLiteWrapper({ ...config, name: '' }))
        .toThrow('Nome do banco de dados é obrigatório');
    });
  });

  describe('replaceParams', () => {
    test('deve substituir placeholders com strings', async () => {
      const sql = 'SELECT * FROM users WHERE name = ? AND age = ?';
      const params = ['John', '30'];
      
      await wrapper.exec(sql, params);
      
      expect(global.__mockExecAsync).toHaveBeenCalledWith(
        "SELECT * FROM users WHERE name = 'John' AND age = '30'"
      );
    });

    test('deve substituir placeholders com números', async () => {
      const sql = 'INSERT INTO products (price, quantity) VALUES (?, ?)';
      const params = [10.5, 100];
      
      await wrapper.exec(sql, params);
      
      expect(global.__mockExecAsync).toHaveBeenCalledWith(
        'INSERT INTO products (price, quantity) VALUES (10.5, 100)'
      );
    });

    test('deve substituir placeholders com null/undefined', async () => {
      const sql = 'INSERT INTO users (name, age) VALUES (?, ?)';
      const params = ['John', null];
      
      await wrapper.exec(sql, params);
      
      expect(global.__mockExecAsync).toHaveBeenCalledWith(
        "INSERT INTO users (name, age) VALUES ('John', NULL)"
      );
    });

    test('deve falhar quando sql for undefined', async () => {
      const sql = undefined;
      const params = ['test'];
      
      await expect(wrapper.exec(sql as any, params))
        .rejects
        .toThrow('SQL query não pode ser undefined, null ou vazia');
    });

    test('deve falhar quando sql for string vazia', async () => {
      const sql = '';
      const params = ['test'];
      
      await expect(wrapper.exec(sql, params))
        .rejects
        .toThrow('SQL query não pode ser undefined, null ou vazia');
    });

    test('deve falhar quando número de params não bater com placeholders', async () => {
      const sql = 'SELECT * FROM users WHERE name = ? AND age = ?';
      const params = ['John'];
      
      await expect(wrapper.exec(sql, params))
        .rejects
        .toThrow('Mismatch entre placeholders e parâmetros na query SQL');
    });

    test('deve tratar strings com aspas simples corretamente', async () => {
      const sql = "INSERT INTO users (name) VALUES (?)";
      const params = ["O'Connor"];
      
      await wrapper.exec(sql, params);
      
      expect(global.__mockExecAsync).toHaveBeenCalledWith(
        "INSERT INTO users (name) VALUES ('O''Connor')"
      );
    });
  });

  describe('exec', () => {
    test('deve executar query SELECT com sucesso', async () => {
      const mockResult = [{ id: 1, name: 'Test' }];
      global.__mockExecAsync.mockResolvedValueOnce(mockResult);

      const sql = 'SELECT * FROM users';
      const result = await wrapper.exec(sql);

      expect(result).toEqual(mockResult);
      expect(global.__mockExecAsync).toHaveBeenCalledWith(sql);
    });

    test('deve executar outras queries com sucesso', async () => {
      const sql = 'INSERT INTO users (name) VALUES (?)';
      const params = ['Test'];

      await wrapper.exec(sql, params);

      expect(global.__mockExecAsync).toHaveBeenCalledWith(
        "INSERT INTO users (name) VALUES ('Test')"
      );
    });

    test('deve propagar erros do banco', async () => {
      const error = new Error('Database error');
      global.__mockExecAsync.mockRejectedValueOnce(error);

      const sql = 'SELECT * FROM users';
      
      await expect(wrapper.exec(sql))
        .rejects
        .toThrow('Database error');
    });
  });

  describe('execScalar', () => {
    test('deve retornar primeiro valor da primeira linha', async () => {
      const mockResult = [{ count: 5 }];
      global.__mockExecAsync.mockResolvedValueOnce(mockResult);

      const result = await wrapper.execScalar<number>('SELECT COUNT(*) as count FROM users');

      expect(result).toBe(5);
    });

    test('deve retornar null quando não houver resultados', async () => {
      global.__mockExecAsync.mockResolvedValueOnce([]);

      const result = await wrapper.execScalar('SELECT * FROM users WHERE id = 999');

      expect(result).toBeNull();
    });
  });

  describe('execInsert', () => {
    test('deve retornar id após inserção', async () => {
      global.__mockExecAsync
        .mockResolvedValueOnce(undefined) // Para a inserção
        .mockResolvedValueOnce([{ id: 1 }]); // Para o SELECT last_insert_rowid()

      const result = await wrapper.execInsert(
        'INSERT INTO users (name) VALUES (?)',
        ['Test']
      );

      expect(result).toBe(1);
    });

    test('deve propagar erros de inserção', async () => {
      const error = new Error('Insert error');
      global.__mockExecAsync.mockRejectedValueOnce(error);

      await expect(
        wrapper.execInsert('INSERT INTO users (name) VALUES (?)', ['Test'])
      ).rejects.toThrow('Insert error');
    });
  });
});
