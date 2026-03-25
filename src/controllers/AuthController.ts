// src/controllers/AuthController.ts
import { controller, httpPost } from "inversify-express-utils";
import { inject } from "inversify";
import { Request, Response } from "express";
import { TYPES } from "../config/types";
import { AuthService } from "../services/AuthService";
import { validateDto } from "../middlewares/ValidateDto";
import { RegisterDto } from "../dtos/RegisterDto";

@controller("/auth")
export class AuthController {
    
    constructor(@inject(TYPES.AuthService) private authService: AuthService) {}

    @httpPost("/register", validateDto(RegisterDto))
    async register(req: Request, res: Response) {
        try {
            const result = await this.authService.register(req.body);
            res.status(201).json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}