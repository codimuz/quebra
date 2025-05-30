import { Migration } from '../../../types/database';
import * as initialSchema from './001_initial_schema';

// Array com todas as migrações em ordem cronológica
export const migrations: Migration[] = [
  {
    name: initialSchema.migrationName,
    version: initialSchema.version,
    description: initialSchema.description,
    up: initialSchema.up,
    down: initialSchema.down
  }
];

// Função auxiliar para encontrar uma migração por versão
export function findMigrationByVersion(version: number): Migration | undefined {
  return migrations.find(m => m.version === version);
}

// Função auxiliar para encontrar uma migração por nome
export function findMigrationByName(name: string): Migration | undefined {
  return migrations.find(m => m.name === name);
}

// Função auxiliar para encontrar todas as migrações após uma versão específica
export function findMigrationsAfterVersion(version: number): Migration[] {
  return migrations.filter(m => m.version > version)
    .sort((a, b) => a.version - b.version);
}

// Função auxiliar para encontrar todas as migrações antes de uma versão específica
export function findMigrationsBeforeVersion(version: number): Migration[] {
  return migrations.filter(m => m.version < version)
    .sort((a, b) => b.version - a.version);
}

// Versão mais recente disponível
export const latestVersion = Math.max(...migrations.map(m => m.version));