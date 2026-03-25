// src/dtos/RegisterDto.ts
import { IsEmail, IsString, MinLength } from "class-validator";

// [SRP]: Solo valida datos de entrada.
export class RegisterDto {
    @IsEmail({}, { message: "Email inválido" })
    email!: string;

    @IsString()
    @MinLength(6, { message: "La contraseña debe tener mínimo 6 caracteres" })
    password!: string;

    @IsString()
    @MinLength(2)
    name!: string;
}