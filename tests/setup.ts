/**
 * SETUP GLOBAL DE TESTS
 * 
 * BEST PRACTICES:
 * - Configuración centralizada para todos los tests
 * - Timeout configurado para tests que pueden tardar
 * - reflect-metadata para decoradores de InversifyJS
 * 
 * CLEAN CODE:
 * - Single Responsibility: Solo configuración de entorno de testing
 */

import 'reflect-metadata';

// Configurar timeout global para tests (5 segundos)
jest.setTimeout(5000);

// Mock de console para evitar logs durante tests (opcional)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
// };
