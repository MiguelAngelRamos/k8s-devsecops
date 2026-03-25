"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
// src/services/AuthService.ts
const inversify_1 = require("inversify");
const types_1 = require("../config/types");
const User_1 = require("../domain/entities/User");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
//import { v4 as uuidv4 } from "uuid"; // (Nota: puedes usar crypto.randomUUID si no quieres instalar uuid)
let AuthService = class AuthService {
    // [DIP]: Inyectamos la Interfaz (Abstracción), no la clase SQLiteUserRepository.
    constructor(userRepo) {
        this.userRepo = userRepo;
    }
    async register(dto) {
        // 1. Verificar si existe
        const existing = await this.userRepo.findByEmail(dto.email);
        if (existing)
            throw new Error("El usuario ya existe");
        // 2. Hash password
        const hashedPassword = await bcryptjs_1.default.hash(dto.password, 10);
        // 3. Crear entidad
        // Nota: Para simplificar usamos Date.now como ID, en prod usar UUID
        const newUser = new User_1.User(Date.now().toString(), dto.email, hashedPassword, dto.name);
        // 4. Guardar
        await this.userRepo.create(newUser);
        // 5. Generar JWT
        const token = jsonwebtoken_1.default.sign({ id: newUser.id,
            email: newUser.email
        }, "TU_SECRETO_JWT", { expiresIn: "1h" });
        // Retornamos token y datos del usuario (sin password)
        const { password, ...userWithoutPass } = newUser;
        return {
            token: token,
            user: userWithoutPass
        };
        // return {
        //   token: token,
        //   user:{ id: newUser.id,
        //          email: newUser.email,
        //          name: newUser.name
        //   }
        // }
        // user.email
        // return { token, user: userWithoutPass };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.TYPES.UserRepository)),
    __metadata("design:paramtypes", [Object])
], AuthService);
