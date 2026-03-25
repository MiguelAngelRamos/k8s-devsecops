// src/container.ts
import { Container } from "inversify";
import { TYPES } from "./config/types";

// Interfaces
import { IUserRepository } from "./domain/interfaces/IUserRepository";

// Implementaciones
import { PostgresUserRepository } from "./infrastructure/repositories/PostgresUserRepository";
import { AuthService } from "./services/AuthService";

// Controladores (Importante importarlos aquí para que se registren)
import "./controllers/AuthController";

const container = new Container();

// [Binding]: Aquí decimos "Cuando alguien pida IUserRepository, dale PostgresUserRepository"
// inSingletonScope = Una sola instancia de la DB para toda la app.
container.bind<IUserRepository>(TYPES.UserRepository).to(PostgresUserRepository).inSingletonScope();
container.bind<AuthService>(TYPES.AuthService).to(AuthService).inSingletonScope();

export { container };