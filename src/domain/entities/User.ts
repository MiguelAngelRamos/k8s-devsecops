// src/domain/entities/User.ts
// [SRP]: Responsabilidad Única. Solo define la estructura del usuario.
export class User {
    constructor(
        public id: string,
        public email: string,
        public password: string,
        public name: string
    ) {}
}