export interface Product {
  ean: string;
  price: number;
  description: string;
}

export const PRODUCTS: Product[] = [
  // Eletrônicos
  { ean: '7891234567890', price: 299.99, description: 'Smartphone Android 64GB Dual Chip Tela 6.1"' },
  { ean: '7891234567891', price: 89.90, description: 'Fone de Ouvido Bluetooth Sem Fio com Cancelamento de Ruído' },
  { ean: '7891234567892', price: 149.99, description: 'Carregador Portátil Power Bank 10000mAh USB-C' },
  { ean: '7891234567893', price: 59.90, description: 'Cabo USB-C para USB-A 2 metros Carregamento Rápido' },
  { ean: '7891234567894', price: 199.90, description: 'Mouse Gamer RGB com 7 Botões Programáveis' },
  
  // Casa e Cozinha
  { ean: '7891234567895', price: 45.90, description: 'Panela de Pressão Elétrica 4 Litros Timer Digital' },
  { ean: '7891234567896', price: 129.90, description: 'Liquidificador Turbo 1000W 3 Velocidades Copo de Vidro' },
  { ean: '7891234567897', price: 79.90, description: 'Jogo de Facas Inox 6 Peças com Suporte Bambu' },
  { ean: '7891234567898', price: 25.90, description: 'Forma de Silicone Antiaderente para Bolo 26cm' },
  { ean: '7891234567899', price: 89.90, description: 'Chaleira Elétrica 1.7L Desligamento Automático' },
  
  // Beleza e Higiene
  { ean: '7891234567900', price: 19.90, description: 'Shampoo Hidratante Cabelos Secos 400ml' },
  { ean: '7891234567901', price: 29.90, description: 'Creme Facial Anti-idade com Protetor Solar FPS 30' },
  { ean: '7891234567902', price: 15.90, description: 'Sabonete Líquido Antibacteriano 250ml' },
  { ean: '7891234567903', price: 39.90, description: 'Escova de Dentes Elétrica com 3 Refis' },
  { ean: '7891234567904', price: 12.90, description: 'Desodorante Roll-on 48h Proteção' },
  
  // Roupas e Acessórios
  { ean: '7891234567905', price: 69.90, description: 'Camiseta Básica 100% Algodão Masculina Tamanho M' },
  { ean: '7891234567906', price: 159.90, description: 'Tênis Esportivo Running Masculino Preto/Branco 42' },
  { ean: '7891234567907', price: 49.90, description: 'Boné Aba Curva Ajustável Bordado Logo' },
  { ean: '7891234567908', price: 29.90, description: 'Meia Esportiva Kit 3 Pares Algodão' },
  { ean: '7891234567909', price: 199.90, description: 'Relógio Digital Esportivo Resistente à Água' },
  
  // Livros e Papelaria
  { ean: '7891234567910', price: 24.90, description: 'Caderno Universitário 200 Folhas Capa Dura' },
  { ean: '7891234567911', price: 39.90, description: 'Livro de Programação JavaScript para Iniciantes' },
  { ean: '7891234567912', price: 8.90, description: 'Caneta Esferográfica Azul Kit 10 Unidades' },
  { ean: '7891234567913', price: 15.90, description: 'Marca Texto Fluorescente Kit 6 Cores' },
  { ean: '7891234567914', price: 12.90, description: 'Agenda 2024 Capa Flexível Planejamento Semanal' },
  
  // Alimentação
  { ean: '7891234567915', price: 8.90, description: 'Café em Pó Torrado e Moído 250g' },
  { ean: '7891234567916', price: 12.90, description: 'Chocolate ao Leite 200g Amendoim' },
  { ean: '7891234567917', price: 6.90, description: 'Biscoito Recheado Chocolate 140g' },
  { ean: '7891234567918', price: 4.90, description: 'Refrigerante Cola 2 Litros' },
  { ean: '7891234567919', price: 18.90, description: 'Azeite Extra Virgem 500ml Primeira Prensagem' },
  
  // Ferramentas e Auto
  { ean: '7891234567920', price: 89.90, description: 'Furadeira Elétrica 400W com Kit Brocas' },
  { ean: '7891234567921', price: 29.90, description: 'Chave de Fenda Philips Cabo Emborrachado' },
  { ean: '7891234567922', price: 159.90, description: 'Kit Ferramentas 50 Peças Maleta Organizadora' },
  { ean: '7891234567923', price: 39.90, description: 'Óleo Motor 5W30 Sintético 1 Litro' },
  { ean: '7891234567924', price: 12.90, description: 'Lâmpada LED H4 12V Automotiva Branca' },
];
