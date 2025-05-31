export const TABLES = {
  PRODUCTS: `
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      indice INTEGER,
      codigo_produto TEXT UNIQUE NOT NULL,
      nome_produto TEXT NOT NULL,
      descricao TEXT,
      marca TEXT,
      preco REAL NOT NULL,
      unidade TEXT,
      imagem_url TEXT,
      observacoes TEXT,
      compra_minima INTEGER,
      acrescimo REAL,
      url_produto TEXT,
      data_extracao TEXT,
      codigo_curto_ean TEXT,
      volume_por_unidade_l REAL,
      peso_por_unidade_kg REAL,
      quantidade_embalagem INTEGER,
      volume_total_l REAL,
      peso_total_kg REAL,
      status_extracao TEXT,
      data_processamento TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted_at TEXT,
      restored_at TEXT
    )`,
  
  REASONS: `
    CREATE TABLE IF NOT EXISTS reasons (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL,
      is_active BOOLEAN DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`,
  
  ENTRIES: `
    CREATE TABLE IF NOT EXISTS entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_code TEXT NOT NULL,
      product_name TEXT NOT NULL,
      quantity_lost REAL NOT NULL,
      unit_cost REAL DEFAULT 0.0,
      reason_id TEXT NOT NULL,
      notes TEXT,
      entry_date TEXT NOT NULL,
      is_synchronized BOOLEAN DEFAULT 0,
      created_at TEXT,
      updated_at TEXT,
      FOREIGN KEY (product_code) REFERENCES products (codigo_produto),
      FOREIGN KEY (reason_id) REFERENCES reasons (id)
    )`,
  
  ENTRY_CHANGES: `
    CREATE TABLE IF NOT EXISTS entry_changes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entry_id INTEGER NOT NULL,
      product_code TEXT NOT NULL,
      product_name TEXT NOT NULL,
      old_quantity REAL,
      new_quantity REAL NOT NULL,
      old_reason_id TEXT,
      new_reason_id TEXT NOT NULL,
      change_date TEXT NOT NULL,
      action_type TEXT NOT NULL CHECK (action_type IN ('insertion', 'edition', 'removal', 'movement')),
      FOREIGN KEY (entry_id) REFERENCES entries(id),
      FOREIGN KEY (product_code) REFERENCES products (codigo_produto),
      FOREIGN KEY (old_reason_id) REFERENCES reasons (id),
      FOREIGN KEY (new_reason_id) REFERENCES reasons (id)
    )`,
  
  IMPORTS: `
    CREATE TABLE IF NOT EXISTS imports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      file_name TEXT NOT NULL,
      import_date TEXT NOT NULL,
      items_updated INTEGER,
      items_inserted INTEGER,
      source TEXT
    )`
};

// Índices para melhor performance
export const INDEXES = {
  PRODUCTS_CODIGO: 'CREATE INDEX IF NOT EXISTS idx_products_codigo ON products (codigo_produto)',
  PRODUCTS_NOME: 'CREATE INDEX IF NOT EXISTS idx_products_nome ON products (nome_produto COLLATE NOCASE)',
  PRODUCTS_MARCA: 'CREATE INDEX IF NOT EXISTS idx_products_marca ON products (marca COLLATE NOCASE)',
  PRODUCTS_EAN: 'CREATE INDEX IF NOT EXISTS idx_products_ean ON products (codigo_curto_ean)',
  ENTRIES_PRODUCT: 'CREATE INDEX IF NOT EXISTS idx_entries_product ON entries (product_code)',
  ENTRIES_DATE: 'CREATE INDEX IF NOT EXISTS idx_entries_date ON entries (entry_date)',
  ENTRIES_REASON: 'CREATE INDEX IF NOT EXISTS idx_entries_reason ON entries (reason_id)',
  ENTRY_CHANGES_ENTRY_ID: 'CREATE INDEX IF NOT EXISTS idx_entry_changes_entry_id ON entry_changes (entry_id)',
  ENTRY_CHANGES_PRODUCT: 'CREATE INDEX IF NOT EXISTS idx_entry_changes_product ON entry_changes (product_code)',
  ENTRY_CHANGES_DATE: 'CREATE INDEX IF NOT EXISTS idx_entry_changes_date ON entry_changes (change_date)',
  IMPORTS_DATE: 'CREATE INDEX IF NOT EXISTS idx_imports_date ON imports (import_date)',
  REASONS_CODE: 'CREATE INDEX IF NOT EXISTS idx_reasons_code ON reasons (code)'
};

// Dados iniciais para a tabela reasons
export const INITIAL_REASONS = [
  {
    id: "1",
    code: "01",
    description: "Produto Vencido",
    is_active: 1,
    created_at: "2025-05-25T10:02:00-03:00",
    updated_at: "2025-05-25T10:02:00-03:00"
  },
  {
    id: "2",
    code: "02",
    description: "Produto Danificado",
    is_active: 1,
    created_at: "2025-05-25T10:02:00-03:00",
    updated_at: "2025-05-25T10:02:00-03:00"
  },
  {
    id: "3",
    code: "03",
    description: "Degustação no Depósito",
    is_active: 1,
    created_at: "2025-05-25T10:02:00-03:00",
    updated_at: "2025-05-25T10:02:00-03:00"
  },
  {
    id: "4",
    code: "04",
    description: "Degustação na Loja",
    is_active: 1,
    created_at: "2025-05-25T10:02:00-03:00",
    updated_at: "2025-05-25T10:02:00-03:00"
  },
  {
    id: "5",
    code: "05",
    description: "Furto Interno",
    is_active: 1,
    created_at: "2025-05-25T10:02:00-03:00",
    updated_at: "2025-05-25T10:02:00-03:00"
  },
  {
    id: "6",
    code: "06",
    description: "Furto na Área de Vendas",
    is_active: 1,
    created_at: "2025-05-25T10:02:00-03:00",
    updated_at: "2025-05-25T10:02:00-03:00"
  },
  {
    id: "7",
    code: "07",
    description: "Alimento Produzido para o Refeitório",
    is_active: 1,
    created_at: "2025-05-25T10:02:00-03:00",
    updated_at: "2025-05-25T10:02:00-03:00"
  },
  {
    id: "8",
    code: "08",
    description: "Furto Não Recuperado",
    is_active: 1,
    created_at: "2025-05-25T10:02:00-03:00",
    updated_at: "2025-05-25T10:02:00-03:00"
  }
];

// Dados iniciais para a tabela products (novo formato baseado em src/data/products.json)
export const INITIAL_PRODUCTS = [
  {
    indice: 1,
    codigo_produto: "0000000001595",
    nome_produto: "Banana-caturra",
    descricao: "BANANA CATURRA KG",
    marca: "Sem marca",
    preco: 2.49,
    unidade: "KG",
    imagem_url: "https://6gpgv15qo7spvwl6littydn.blob.core.windows.net/hybris/master/condor/images/515Wx515H/0000000001595.jpg",
    observacoes: "Atenção: este item tem peso variável...",
    compra_minima: 1,
    acrescimo: 0.200,
    url_produto: "https://www.condor.com.br/product/0000000001595/Banana-caturra",
    data_extracao: "2025-05-26T14:31:57.809Z",
    codigo_curto_ean: "1595",
    volume_por_unidade_l: null,
    peso_por_unidade_kg: 0.200,
    quantidade_embalagem: 1,
    volume_total_l: null,
    peso_total_kg: 0.200,
    status_extracao: "sucesso",
    data_processamento: "2025-05-26T14:31:57.811Z",
    created_at: "2025-05-26T14:31:57.811Z",
    updated_at: "2025-05-26T14:31:57.811Z"
  },
  {
    indice: 2,
    codigo_produto: "0000000003421",
    nome_produto: "Cebola",
    descricao: "CEBOLA KG",
    marca: "DA NOSSA",
    preco: 3.99,
    unidade: "KG",
    imagem_url: "https://6gpgv15qo7spvwl6littydn.blob.core.windows.net/hybris/master/condor/images/515Wx515H/0000000003421.jpg",
    observacoes: "Atenção: este item tem peso variável...",
    compra_minima: 1,
    acrescimo: 0.150,
    url_produto: "https://www.condor.com.br/product/0000000003421/Cebola",
    data_extracao: "2025-05-26T14:32:09.521Z",
    codigo_curto_ean: "3421",
    volume_por_unidade_l: null,
    peso_por_unidade_kg: 0.150,
    quantidade_embalagem: 1,
    volume_total_l: null,
    peso_total_kg: 0.150,
    status_extracao: "sucesso",
    data_processamento: "2025-05-26T14:32:09.522Z",
    created_at: "2025-05-26T14:32:09.522Z",
    updated_at: "2025-05-26T14:32:09.522Z"
  }
];