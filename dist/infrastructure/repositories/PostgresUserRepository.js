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
exports.PostgresUserRepository = void 0;
const inversify_1 = require("inversify");
const User_1 = require("../../domain/entities/User");
const postgres_1 = __importDefault(require("../db/postgres"));
let PostgresUserRepository = class PostgresUserRepository {
    async findByEmail(email) {
        const query = 'SELECT * FROM users WHERE email = $1';
        const result = await postgres_1.default.query(query, [email]);
        if (result.rows.length === 0)
            return null;
        const row = result.rows[0];
        return new User_1.User(row.id, row.email, row.password, row.name);
    }
    async create(user) {
        const query = 'INSERT INTO users (id, email, password, name) VALUES ($1, $2, $3, $4) RETURNING *';
        try {
            await postgres_1.default.query(query, [user.id, user.email, user.password, user.name]);
            return user;
        }
        catch (error) {
            console.error("Error al crear usuario en BD PostgreSQL:", error);
            throw new Error("Error al crear usuario en BD");
        }
    }
};
exports.PostgresUserRepository = PostgresUserRepository;
exports.PostgresUserRepository = PostgresUserRepository = __decorate([
    (0, inversify_1.injectable)()
], PostgresUserRepository);
