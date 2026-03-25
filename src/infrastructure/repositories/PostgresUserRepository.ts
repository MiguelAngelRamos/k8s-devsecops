import { injectable } from "inversify";
import { IUserRepository } from "../../domain/interfaces/IUserRepository";
import { User } from "../../domain/entities/User";
import pool from "../db/postgres";

@injectable()
export class PostgresUserRepository implements IUserRepository {

    async findByEmail(email: string): Promise<User | null> {
        const query = 'SELECT * FROM users WHERE email = $1';
        const result = await pool.query(query, [email]);

        if (result.rows.length === 0) return null;

        const row = result.rows[0];
        return new User(row.id, row.email, row.password, row.name);
    }

    async create(user: User): Promise<User> {
        const query = 'INSERT INTO users (id, email, password, name) VALUES ($1, $2, $3, $4) RETURNING *';
        try {
            await pool.query(query, [user.id, user.email, user.password, user.name]);
            return user;
        } catch (error) {
            console.error("Error al crear usuario en BD PostgreSQL:", error);
            throw new Error("Error al crear usuario en BD");
        }
    }
}
