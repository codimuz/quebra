import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Text,
  Card,
  useTheme,
  List,
  Searchbar,
  Chip,
  Button,
} from 'react-native-paper';
import GlobalFAB, { FABAction } from '../components/GlobalFAB';

const MOTIVOS_DATA = [
  { id: '01', label: 'Produto vencido', description: 'Produtos com data de validade expirada', category: 'Qualidade' },
  { id: '02', label: 'Produto danificado', description: 'Produtos com danos físicos ou embalagem comprometida', category: 'Qualidade' },
  { id: '03', label: 'Degustação (depósito)', description: 'Produtos utilizados para degustação no depósito', category: 'Comercial' },
  { id: '04', label: 'Degustação (loja)', description: 'Produtos utilizados para degustação na loja', category: 'Comercial' },
  { id: '05', label: 'Furto interno', description: 'Produtos furtados por funcionários', category: 'Segurança' },
  { id: '06', label: 'Furto na área de vendas', description: 'Produtos furtados por clientes', category: 'Segurança' },
  { id: '07', label: 'Alimento preparado para o refeitório', description: 'Produtos utilizados no refeitório da empresa', category: 'Interno' },
  { id: '08', label: 'Furto não recuperado', description: 'Produtos furtados não recuperados', category: 'Segurança' },
  { id: '09', label: 'Trocas ou devoluções', description: 'Produtos devolvidos ou trocados pelos clientes', category: 'Comercial' },
  { id: '10', label: 'Ajuste de inventário', description: 'Ajustes realizados durante o inventário', category: 'Administrativo' },
];

const CATEGORIES = ['Todos', 'Qualidade', 'Comercial', 'Segurança', 'Interno', 'Administrativo'];

export default function MotivosScreen() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedMotivos, setSelectedMotivos] = useState<string[]>([]);

  const filteredMotivos = MOTIVOS_DATA.filter(motivo => {
    const matchesSearch = motivo.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         motivo.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || motivo.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleMotivo = (motivoId: string) => {
    setSelectedMotivos(prev => 
      prev.includes(motivoId) 
        ? prev.filter(id => id !== motivoId)
        : [...prev, motivoId]
    );
  };

  const clearSelection = () => {
    setSelectedMotivos([]);
  };

  const fabActions: FABAction[] = [
    {
      icon: 'plus',
      label: 'Adicionar Motivo',
      onPress: () => console.log('Adicionar novo motivo'),
      accessibilityLabel: 'Adicionar novo motivo'
    },
    {
      icon: 'content-save',
      label: 'Salvar Seleção',
      onPress: () => console.log('Salvar motivos selecionados:', selectedMotivos),
      accessibilityLabel: 'Salvar motivos selecionados'
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.contentWrapper}>
          {/* Barra de Pesquisa */}
          <Searchbar
            placeholder="Buscar motivos..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
          />

          {/* Filtros por Categoria */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScrollView}
          >
            <View style={styles.categoryContainer}>
              {CATEGORIES.map(category => (
                <Chip
                  key={category}
                  selected={selectedCategory === category}
                  onPress={() => setSelectedCategory(category)}
                  style={styles.categoryChip}
                  mode={selectedCategory === category ? 'flat' : 'outlined'}
                >
                  {category}
                </Chip>
              ))}
            </View>
          </ScrollView>

          {/* Motivos Selecionados */}
          {selectedMotivos.length > 0 && (
            <Card style={styles.selectedCard}>
              <Card.Content>
                <View style={styles.selectedHeader}>
                  <Text variant="titleMedium">
                    Motivos Selecionados ({selectedMotivos.length})
                  </Text>
                  <Button mode="text" onPress={clearSelection}>
                    Limpar
                  </Button>
                </View>
                <View style={styles.selectedChipsContainer}>
                  {selectedMotivos.map(motivoId => {
                    const motivo = MOTIVOS_DATA.find(m => m.id === motivoId);
                    return motivo ? (
                      <Chip
                        key={motivoId}
                        onClose={() => toggleMotivo(motivoId)}
                        style={styles.selectedChip}
                      >
                        {motivo.id} - {motivo.label}
                      </Chip>
                    ) : null;
                  })}
                </View>
              </Card.Content>
            </Card>
          )}

          {/* Lista de Motivos */}
          <Card style={styles.motivosCard}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Motivos Disponíveis
              </Text>
              {filteredMotivos.map(motivo => (
                <List.Item
                  key={motivo.id}
                  title={`${motivo.id} – ${motivo.label}`}
                  description={motivo.description}
                  left={() => (
                    <List.Icon 
                      icon={selectedMotivos.includes(motivo.id) ? 'checkbox-marked' : 'checkbox-blank-outline'} 
                      color={selectedMotivos.includes(motivo.id) ? theme.colors.primary : theme.colors.onSurface}
                    />
                  )}
                  right={() => (
                    <Chip 
                      compact 
                      mode="outlined"
                      style={styles.categoryBadge}
                    >
                      {motivo.category}
                    </Chip>
                  )}
                  onPress={() => toggleMotivo(motivo.id)}
                  style={[
                    styles.motivoItem,
                    selectedMotivos.includes(motivo.id) && {
                      backgroundColor: theme.colors.primaryContainer
                    }
                  ]}
                />
              ))}
              
              {filteredMotivos.length === 0 && (
                <View style={styles.emptyState}>
                  <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                    Nenhum motivo encontrado para a busca "{searchQuery}"
                  </Text>
                </View>
              )}
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
      
      <GlobalFAB actions={fabActions} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentWrapper: {
    padding: 16,
  },
  searchBar: {
    marginBottom: 16,
  },
  categoryScrollView: {
    marginBottom: 16,
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
  },
  categoryChip: {
    marginRight: 8,
  },
  selectedCard: {
    marginBottom: 16,
  },
  selectedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedChip: {
    marginBottom: 4,
  },
  motivosCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: '600',
  },
  motivoItem: {
    borderRadius: 8,
    marginBottom: 4,
  },
  categoryBadge: {
    alignSelf: 'center',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
});
