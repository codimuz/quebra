import productsData from './products.json';

export interface Product {
  indice: number;
  codigoProduto: string;
  nome: string;
  descricao: string;
  marca: string;
  preco: number;
  unidade: string;
  imagem: string;
  observacoes: string | null;
  compraMinima: number | null;
  acrescimo: number | null;
  url: string;
  dataExtracao: string;
  codigoCurtoean: string | null;
  volumePorUnidadeL: number | null;
  pesoPorUnidadeKg: number | null;
  quantidadeEmbalagem: number;
  volumeTotalL: number | null;
  pesoTotalKg: number | null;
  statusExtracao: string;
  dataProcessamento: string;
}

export const PRODUCTS: Product[] = productsData as Product[];