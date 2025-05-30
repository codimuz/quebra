import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, Dimensions } from 'react-native';
import {
  Text,
  Card,
  useTheme,
  Button,
  Chip,
  DataTable,
  SegmentedButtons,
} from 'react-native-paper';
import GlobalFAB, { FABAction } from '../components/GlobalFAB';

const { width } = Dimensions.get('window');

// Dados mockados para demonstração
const SAMPLE_DATA = [
  {
    id: '001',
    produto: 'Arroz Integral 1kg',
    motivo: '01 – Produto vencido',
    quantidade: '5',
    valor: 'R$ 35,00',
    data: '28/12/2024',
    responsavel: 'João Silva'
  },
  {
    id: '002',
    produto: 'Leite UHT 1L',
    motivo: '02 – Produto danificado',
    quantidade: '3',
    valor: 'R$ 15,00',
    data: '27/12/2024',
    responsavel: 'Maria Santos'
  },
  {
    id: '003',
    produto: 'Chocolate 200g',
    motivo: '04 – Degustação (loja)',
    quantidade: '2',
    valor: 'R$ 24,00',
    data: '26/12/2024',
    responsavel: 'Pedro Costa'
  },
  {
    id: '004',
    produto: 'Café 500g',
    motivo: '09 – Trocas ou devoluções',
    quantidade: '1',
    valor: 'R$ 18,00',
    data: '25/12/2024',
    responsavel: 'Ana Lima'
  },
];

const PERIOD_OPTIONS = [
  { value: 'today', label: 'Hoje' },
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mês' },
  { value: 'custom', label: 'Personalizado' },
];

const REPORT_TYPES = [
  { value: 'summary', label: 'Resumo' },
  { value: 'detailed', label: 'Detalhado' },
  { value: 'analytics', label: 'Análise' },
];

export default function RelatoriosScreen() {
  const theme = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedReportType, setSelectedReportType] = useState('summary');
  const [showDetails, setShowDetails] = useState(false);

  // Cálculos de resumo
  const totalItems = SAMPLE_DATA.length;
  const totalValue = SAMPLE_DATA.reduce((sum, item) => {
    const value = parseFloat(item.valor.replace('R$ ', '').replace(',', '.'));
    return sum + value;
  }, 0);

  const motivosSummary = SAMPLE_DATA.reduce((acc, item) => {
    const motivo = item.motivo.split(' – ')[0];
    acc[motivo] = (acc[motivo] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const fabActions: FABAction[] = [
    {
      icon: 'download',
      label: 'Exportar PDF',
      onPress: () => console.log('Exportar relatório em PDF'),
      accessibilityLabel: 'Exportar relatório em PDF'
    },
    {
      icon: 'microsoft-excel',
      label: 'Exportar Excel',
      onPress: () => console.log('Exportar relatório em Excel'),
      accessibilityLabel: 'Exportar relatório em Excel'
    },
    {
      icon: 'share',
      label: 'Compartilhar',
      onPress: () => console.log('Compartilhar relatório'),
      accessibilityLabel: 'Compartilhar relatório'
    },
  ];

  const renderSummaryView = () => (
    <>
      {/* Cards de Resumo */}
      <View style={styles.summaryGrid}>
        <Card style={[styles.summaryCard, { backgroundColor: theme.colors.primaryContainer }]}>
          <Card.Content style={styles.summaryCardContent}>
            <Text variant="headlineMedium" style={{ color: theme.colors.onPrimaryContainer, fontWeight: 'bold' }}>
              {totalItems}
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onPrimaryContainer }}>
              Total de Registros
            </Text>
          </Card.Content>
        </Card>

        <Card style={[styles.summaryCard, { backgroundColor: theme.colors.secondaryContainer }]}>
          <Card.Content style={styles.summaryCardContent}>
            <Text variant="headlineMedium" style={{ color: theme.colors.onSecondaryContainer, fontWeight: 'bold' }}>
              R$ {totalValue.toFixed(2)}
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSecondaryContainer }}>
              Valor Total
            </Text>
          </Card.Content>
        </Card>
      </View>

      {/* Resumo por Motivos */}
      <Card style={styles.motivosCard}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Distribuição por Motivos
          </Text>
          {Object.entries(motivosSummary).map(([motivo, count]) => (
            <View key={motivo} style={[
              styles.motivoSummaryRow,
              { borderBottomColor: theme.colors.outlineVariant }
            ]}>
              <View style={styles.motivoInfo}>
                <Text variant="bodyLarge">{motivo}</Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  {count} registro{count !== 1 ? 's' : ''}
                </Text>
              </View>
              <Chip mode="outlined">
                {((count / totalItems) * 100).toFixed(1)}%
              </Chip>
            </View>
          ))}
        </Card.Content>
      </Card>
    </>
  );

  const renderDetailedView = () => (
    <Card style={[styles.tableCard, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <Text variant="titleLarge" style={[
          styles.sectionTitle,
          { color: theme.colors.onSurface }
        ]}>
          Registros Detalhados
        </Text>
        <DataTable style={{ backgroundColor: theme.colors.surface }}>
          <DataTable.Header>
            <DataTable.Title>Produto</DataTable.Title>
            <DataTable.Title>Motivo</DataTable.Title>
            <DataTable.Title numeric>Valor</DataTable.Title>
          </DataTable.Header>

          {SAMPLE_DATA.map((item) => (
            <DataTable.Row key={item.id}>
              <DataTable.Cell>{item.produto}</DataTable.Cell>
              <DataTable.Cell>{item.motivo.split(' – ')[0]}</DataTable.Cell>
              <DataTable.Cell numeric>{item.valor}</DataTable.Cell>
            </DataTable.Row>
          ))}
        </DataTable>

        <View style={[
          styles.tableFooter,
          { borderTopColor: theme.colors.outlineVariant }
        ]}>
          <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
            Total: R$ {totalValue.toFixed(2)}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  const renderAnalyticsView = () => (
    <Card style={[styles.analyticsCard, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <Text variant="titleLarge" style={[
          styles.sectionTitle,
          { color: theme.colors.onSurface }
        ]}>
          Análise de Tendências
        </Text>
        
        <View style={[
          styles.analyticsItem,
          { borderBottomColor: theme.colors.outlineVariant }
        ]}>
          <Text variant="titleMedium">Motivo Mais Frequente</Text>
          <Text variant="bodyLarge" style={{ color: theme.colors.primary }}>
            Produto vencido (25% dos casos)
          </Text>
        </View>

        <View style={[
          styles.analyticsItem,
          { borderBottomColor: theme.colors.outlineVariant }
        ]}>
          <Text variant="titleMedium">Valor Médio por Registro</Text>
          <Text variant="bodyLarge" style={{ color: theme.colors.primary }}>
            R$ {(totalValue / totalItems).toFixed(2)}
          </Text>
        </View>

        <View style={[
          styles.analyticsItem,
          { borderBottomColor: theme.colors.outlineVariant }
        ]}>
          <Text variant="titleMedium">Responsável Mais Ativo</Text>
          <Text variant="bodyLarge" style={{ color: theme.colors.primary }}>
            João Silva (1 registro)
          </Text>
        </View>

        <View style={[
          styles.analyticsItem,
          { borderBottomColor: theme.colors.outlineVariant }
        ]}>
          <Text variant="titleMedium">Recomendações</Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            • Revisar controle de validade dos produtos
            {'\n'}• Implementar melhor sistema de rotatividade
            {'\n'}• Treinar equipe sobre manuseio adequado
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.contentWrapper}>
          {/* Filtros de Período */}
          <Card
            style={[
              styles.filtersCard,
              { backgroundColor: theme.colors.surface }
            ]}
          >
            <Card.Content>
              <Text variant="titleMedium" style={[
                styles.filterTitle,
                { color: theme.colors.onSurface }
              ]}>
                Período do Relatório
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chipContainer}>
                  {PERIOD_OPTIONS.map(option => (
                    <Chip
                      key={option.value}
                      selected={selectedPeriod === option.value}
                      onPress={() => setSelectedPeriod(option.value)}
                      style={styles.periodChip}
                      mode={selectedPeriod === option.value ? 'flat' : 'outlined'}
                    >
                      {option.label}
                    </Chip>
                  ))}
                </View>
              </ScrollView>
            </Card.Content>
          </Card>

          {/* Tipo de Relatório */}
          <SegmentedButtons
            value={selectedReportType}
            onValueChange={setSelectedReportType}
            buttons={REPORT_TYPES}
            style={styles.segmentedButtons}
          />

          {/* Conteúdo do Relatório */}
          {selectedReportType === 'summary' && renderSummaryView()}
          {selectedReportType === 'detailed' && renderDetailedView()}
          {selectedReportType === 'analytics' && renderAnalyticsView()}

          {/* Ações */}
          <View style={styles.actionsContainer}>
            <Button
              mode="contained"
              onPress={() => console.log('Atualizar relatório')}
              style={styles.actionButton}
              icon="refresh"
            >
              Atualizar
            </Button>
            <Button
              mode="outlined"
              onPress={() => console.log('Filtros avançados')}
              style={styles.actionButton}
              icon="filter"
            >
              Filtros
            </Button>
          </View>
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
  filtersCard: {
    marginBottom: 16,
  },
  filterTitle: {
    marginBottom: 12,
    fontWeight: '600',
  },
  chipContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  periodChip: {
    marginRight: 8,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    elevation: 2,
  },
  summaryCardContent: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  motivosCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: '600',
  },
  motivoSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  motivoInfo: {
    flex: 1,
  },
  tableCard: {
    marginBottom: 16,
  },
  tableFooter: {
    paddingTop: 16,
    borderTopWidth: 1,
    alignItems: 'flex-end',
  },
  analyticsCard: {
    marginBottom: 16,
  },
  analyticsItem: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
  },
});
