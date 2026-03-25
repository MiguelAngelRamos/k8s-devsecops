"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.container = void 0;
// src/container.ts
const inversify_1 = require("inversify");
const types_1 = require("./config/types");
// Implementaciones
const PostgresUserRepository_1 = require("./infrastructure/repositories/PostgresUserRepository");
const AuthService_1 = require("./services/AuthService");
// Controladores (Importante importarlos aquí para que se registren)
require("./controllers/AuthController");
const container = new inversify_1.Container();
exports.container = container;
// [Binding]: Aquí decimos "Cuando alguien pida IUserRepository, dale PostgresUserRepository"
// inSingletonScope = Una sola instancia de la DB para toda la app.
container.bind(types_1.TYPES.UserRepository).to(PostgresUserRepository_1.PostgresUserRepository).inSingletonScope();
container.bind(types_1.TYPES.AuthService).to(AuthService_1.AuthService).inSingletonScope();
