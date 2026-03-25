"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
// src/domain/entities/User.ts
// [SRP]: Responsabilidad Única. Solo define la estructura del usuario.
class User {
    constructor(id, email, password, name) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.name = name;
    }
}
exports.User = User;
