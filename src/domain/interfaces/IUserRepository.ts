// src/domain/interfaces/IUserRepository.ts
import { User } from "../entities/User";

// [ISP]: Segregación de Interfaces. Definimos un contrato claro.
// [DIP]: Inversión de Dependencias. El servicio dependerá de esto, no de SQLite.
export interface IUserRepository {
    findByEmail(email: string): Promise<User | null>;
    create(user: User): Promise<User>;
}