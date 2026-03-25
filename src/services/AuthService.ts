// src/services/AuthService.ts
import { injectable, inject } from "inversify";
import { TYPES } from "../config/types";
import { IUserRepository } from "../domain/interfaces/IUserRepository";
import { RegisterDto } from "../dtos/RegisterDto";
import { User } from "../domain/entities/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
//import { v4 as uuidv4 } from "uuid"; // (Nota: puedes usar crypto.randomUUID si no quieres instalar uuid)

@injectable()
export class AuthService {
    
    // [DIP]: Inyectamos la Interfaz (Abstracción), no la clase SQLiteUserRepository.
    constructor(
        @inject(TYPES.UserRepository) private userRepo: IUserRepository
    ) {}

    async register(dto: RegisterDto): Promise<{ token: string; user: any }> {
        // 1. Verificar si existe
        const existing = await this.userRepo.findByEmail(dto.email);
        if (existing) throw new Error("El usuario ya existe");
          
        // 2. Hash password
        const hashedPassword = await bcrypt.hash(dto.password, 10);

        // 3. Crear entidad
        // Nota: Para simplificar usamos Date.now como ID, en prod usar UUID
        const newUser = new User(
            Date.now().toString(), 
            dto.email, 
            hashedPassword, 
            dto.name
        );

        // 4. Guardar
        await this.userRepo.create(newUser);

        // 5. Generar JWT
        const token = jwt.sign(
            { id: newUser.id, 
              email: newUser.email 
            }, 
            "TU_SECRETO_JWT", 
            { expiresIn: "1h" }
        );

        // Retornamos token y datos del usuario (sin password)
        const { password, ...userWithoutPass } = newUser;

        return {
          token: token,
          user: userWithoutPass
        }
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
}