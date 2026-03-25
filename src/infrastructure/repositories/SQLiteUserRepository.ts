// src/infrastructure/repositories/SQLiteUserRepository.ts
import { injectable } from "inversify";
import { IUserRepository } from "../../domain/interfaces/IUserRepository";
import { User } from "../../domain/entities/User";
import db from "../db/database";

// [LSP]: Sustitución de Liskov. Esta clase cumple el contrato IUserRepository.
@injectable()
export class SQLiteUserRepository implements IUserRepository {

    async findByEmail(email: string): Promise<User | null> {
        const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
        const row = stmt.get(email) as any;

        if (!row) return null;
        return new User(row.id, row.email, row.password, row.name);
    }

    async create(user: User): Promise<User> {
        const stmt = db.prepare('INSERT INTO users (id, email, password, name) VALUES (?, ?, ?, ?)');
        try {
            stmt.run(user.id, user.email, user.password, user.name);
            return user;
        } catch (error) {
            throw new Error("Error al crear usuario en BD");
        }
    }
}