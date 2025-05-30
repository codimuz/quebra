// Basic console setup for tests
global.console = {
  ...console,
  log: console.log,
  error: console.error,
  warn: console.warn,
};

// Mock SQLite Global
global.__mockExecAsync = jest.fn();
global.__mockCloseAsync = jest.fn();
global.__mockDb = {
  execAsync: global.__mockExecAsync,
  closeAsync: global.__mockCloseAsync
};
global.__mockOpenDatabaseSync = jest.fn(() => global.__mockDb);

// Mock expo-sqlite
jest.mock('expo-sqlite', () => ({
  openDatabaseSync: global.__mockOpenDatabaseSync
}));
