"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/infrastructure/db/database.ts
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
// Creamos la BD en memoria RAM
const db = new better_sqlite3_1.default(':memory:');
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
exports.default = db;
