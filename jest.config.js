/**
 * JEST CONFIGURATION
 * 
 * BEST PRACTICES APLICADAS:
 * - Configuración TypeScript con ts-jest para soporte completo
 * - Cobertura de código configurada (coverage)
 * - Verbose mode para mejor debugging
 * - Paths correctos para monorepos y arquitecturas modulares
 * - Setup files para configuración global de tests
 */

module.exports = {
  // Preset de TypeScript para Jest
  preset: 'ts-jest',
  
  // Entorno de ejecución (node para APIs)
  testEnvironment: 'node',
  
  // Archivos de setup que se ejecutan antes de cada test
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  
  // Patrón para encontrar archivos de test
  testMatch: [
    '**/tests/**/*.test.ts',
    '**/tests/**/*.spec.ts'
  ],
  
  // Cobertura de código - BEST PRACTICE: Medir calidad del testing
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts', // Archivo de entrada, no requiere test unitario
    '!src/container.ts', // Configuración de DI
    '!src/infrastructure/db/database.ts' // Configuración de DB
  ],
  
  // Umbrales de cobertura - SENIOR LEVEL: 80% mínimo
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // Directorio para reportes de cobertura
  coverageDirectory: 'coverage',
  
  // Reporteros de cobertura
  coverageReporters: ['text', 'lcov', 'html'],
  
  // Verbose para output detallado
  verbose: true,
  
  // Limpiar mocks automáticamente entre tests - BEST PRACTICE
  clearMocks: true,
  
  // Restore mocks automáticamente - BEST PRACTICE
  restoreMocks: true,
  
  // Module paths para imports absolutos
  moduleDirectories: ['node_modules', 'src'],
  
  // Transformar TypeScript
  transform: {
    '^.+\\.ts$': 'ts-jest'
  }
};
