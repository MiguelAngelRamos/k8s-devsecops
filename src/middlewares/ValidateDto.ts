// src/middlewares/ValidateDto.ts
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Request, Response, NextFunction } from "express";

export function validateDto(dtoClass: any) {
    return async (req: Request, res: Response, next: NextFunction) => {
        // Convierte el JSON body a una Instancia de la clase DTO
        const dtoObj = plainToInstance(dtoClass, req.body);
        const errors = await validate(dtoObj);

        if (errors.length > 0) {
            const messages = errors.map(err => 
                Object.values(err.constraints || {}).join(", ")
            );
            res.status(400).json({ errors: messages });
            return;
        }
        next();
    };
}