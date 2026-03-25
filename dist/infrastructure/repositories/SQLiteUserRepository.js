"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SQLiteUserRepository = void 0;
// src/infrastructure/repositories/SQLiteUserRepository.ts
const inversify_1 = require("inversify");
const User_1 = require("../../domain/entities/User");
const database_1 = __importDefault(require("../db/database"));
// [LSP]: Sustitución de Liskov. Esta clase cumple el contrato IUserRepository.
let SQLiteUserRepository = class SQLiteUserRepository {
    async findByEmail(email) {
        const stmt = database_1.default.prepare('SELECT * FROM users WHERE email = ?');
        const row = stmt.get(email);
        if (!row)
            return null;
        return new User_1.User(row.id, row.email, row.password, row.name);
    }
    async create(user) {
        const stmt = database_1.default.prepare('INSERT INTO users (id, email, password, name) VALUES (?, ?, ?, ?)');
        try {
            stmt.run(user.id, user.email, user.password, user.name);
            return user;
        }
        catch (error) {
            throw new Error("Error al crear usuario en BD");
        }
    }
};
exports.SQLiteUserRepository = SQLiteUserRepository;
exports.SQLiteUserRepository = SQLiteUserRepository = __decorate([
    (0, inversify_1.injectable)()
], SQLiteUserRepository);
