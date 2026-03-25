// src/infrastructure/db/database.ts
import Database from 'better-sqlite3';

// Creamos la BD en memoria RAM
const db = new Database(':memory:');

// Inicializamos la tabla al arrancar
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    name TEXT NOT NULL
  )
`);

console.log("💾 Base de datos SQLite en memoria lista.");

export default db;