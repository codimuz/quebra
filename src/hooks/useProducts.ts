import { useCallback, useState } from 'react';
import { useDataBaseContext } from '../contexts/DatabaseContext';
import { Product, ProductFormData } from '../types/product';

export function useProducts() {
  const { database } = useDataBaseContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadProducts = useCallback(async () => {
    if (!database) return [];

    try {
      setLoading(true);
      setError(null);

      const result = await database.executeSql(
        `SELECT id, product_code, name, description, brand, 
         regular_price, unit_type 
         FROM products 
         WHERE deleted_at IS NULL 
         ORDER BY name`
      );

      return result.rows._array as Product[];
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [database]);

  const createProduct = useCallback(async (product: ProductFormData) => {
    if (!database) throw new Error('Database não inicializado');

    try {
      setLoading(true);
      setError(null);

      const result = await database.executeSql(
        `INSERT INTO products (
          product_code, name, description, brand, 
          regular_price, unit_type
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          product.product_code,
          product.name,
          product.description || null,
          product.brand || null,
          product.regular_price,
          product.unit_type
        ]
      );

      return result.insertId;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [database]);

  const updateProduct = useCallback(async (product: Product) => {
    if (!database) throw new Error('Database não inicializado');

    try {
      setLoading(true);
      setError(null);

      await database.executeSql(
        `UPDATE products 
         SET product_code = ?,
             name = ?,
             description = ?,
             brand = ?,
             regular_price = ?,
             unit_type = ?,
             updated_at = datetime('now')
         WHERE id = ?`,
        [
          product.product_code,
          product.name,
          product.description || null,
          product.brand || null,
          product.regular_price,
          product.unit_type,
          product.id
        ]
      );
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [database]);

  const deleteProduct = useCallback(async (id: number) => {
    if (!database) throw new Error('Database não inicializado');

    try {
      setLoading(true);
      setError(null);

      await database.executeSql(
        `UPDATE products 
         SET deleted_at = datetime('now')
         WHERE id = ?`,
        [id]
      );
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [database]);

  return {
    loadProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    loading,
    error
  };
}

export type UseProductsHook = ReturnType<typeof useProducts>;