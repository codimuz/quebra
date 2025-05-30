import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { ActivityIndicator, Button, Card, FAB, IconButton, Modal, Portal, Text, useTheme } from 'react-native-paper';
import { useProducts } from '../hooks/useProducts';
import { Product, ProductFormData } from '../types/product';
import { withDatabase } from '../contexts/DatabaseContext';
import { ProductForm } from '../components/ProductForm';

function ProdutosScreenContent() {
  const theme = useTheme();
  const { loadProducts, createProduct, updateProduct, deleteProduct, loading, error } = useProducts();
  const [products, setProducts] = useState<Product[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchProducts = useCallback(async () => {
    const items = await loadProducts();
    setProducts(items);
  }, [loadProducts]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleCreateProduct = async (data: ProductFormData) => {
    try {
      setFormLoading(true);
      await createProduct(data);
      await fetchProducts();
      setModalVisible(false);
    } catch (error) {
      console.error('Erro ao criar produto:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateProduct = async (data: ProductFormData) => {
    if (!selectedProduct) return;

    try {
      setFormLoading(true);
      const updatedProduct = {
        ...data,
        id: selectedProduct.id
      } satisfies Product;
      
      await updateProduct(updatedProduct);
      await fetchProducts();
      setModalVisible(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    try {
      await deleteProduct(product.id);
      await fetchProducts();
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
    }
  };

  if (loading && products.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Erro ao carregar produtos:</Text>
        <Text style={styles.errorDetail}>{error.message}</Text>
        <Button mode="contained" onPress={fetchProducts} style={styles.retryButton}>
          Tentar Novamente
        </Button>
      </View>
    );
  }

  if (products.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContainer}>
          <Text>Nenhum produto encontrado</Text>
          <Button mode="contained" onPress={fetchProducts} style={styles.retryButton}>
            Atualizar
          </Button>
        </View>
        <FAB
          icon="plus"
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          onPress={() => {
            setSelectedProduct(null);
            setModalVisible(true);
          }}
        />
      </View>
    );
  }

  const renderItem = ({ item }: { item: Product }) => (
    <Card style={styles.card}>
      <Card.Title
        title={item.name}
        subtitle={`Código: ${item.product_code}`}
        right={(props) => (
          <View style={styles.cardActions}>
            <IconButton
              {...props}
              icon="pencil"
              onPress={() => {
                setSelectedProduct(item);
                setModalVisible(true);
              }}
            />
            <IconButton
              {...props}
              icon="delete"
              onPress={() => handleDeleteProduct(item)}
            />
          </View>
        )}
      />
      <Card.Content>
        {item.description && (
          <Text style={styles.description}>{item.description}</Text>
        )}
        <View style={styles.productDetails}>
          <Text>Marca: {item.brand || 'N/A'}</Text>
          <Text>Preço: R$ {item.regular_price.toFixed(2)}</Text>
          <Text>Unidade: {item.unit_type}</Text>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={fetchProducts}
      />

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => {
          setSelectedProduct(null);
          setModalVisible(true);
        }}
      />

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => {
            setModalVisible(false);
            setSelectedProduct(null);
          }}
          contentContainerStyle={[
            styles.modal,
            { backgroundColor: theme.colors.background }
          ]}
        >
          <Text style={styles.modalTitle}>
            {selectedProduct ? 'Editar Produto' : 'Novo Produto'}
          </Text>
          <ProductForm
            initialData={selectedProduct || undefined}
            onSubmit={selectedProduct ? handleUpdateProduct : handleCreateProduct}
            onCancel={() => {
              setModalVisible(false);
              setSelectedProduct(null);
            }}
            loading={formLoading}
          />
        </Modal>
      </Portal>
    </View>
  );
}

// Envolver o componente com o HOC do banco de dados
export const ProdutosScreen = withDatabase(ProdutosScreenContent);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  cardActions: {
    flexDirection: 'row',
  },
  description: {
    marginBottom: 8,
  },
  productDetails: {
    gap: 4,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 8,
    color: 'red',
  },
  errorDetail: {
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    marginTop: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  modal: {
    margin: 20,
    borderRadius: 8,
    padding: 16,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});

export default ProdutosScreen;