export interface Product {
  id: number;
  product_code: string;
  name: string;
  description?: string;
  brand?: string;
  regular_price: number;
  unit_type: 'KG' | 'UN' | 'L' | 'M2' | 'M3';
}

export type ProductFormData = Omit<Product, 'id'>;