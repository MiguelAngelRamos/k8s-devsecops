"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDto = validateDto;
// src/middlewares/ValidateDto.ts
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
function validateDto(dtoClass) {
    return async (req, res, next) => {
        // Convierte el JSON body a una Instancia de la clase DTO
        const dtoObj = (0, class_transformer_1.plainToInstance)(dtoClass, req.body);
        const errors = await (0, class_validator_1.validate)(dtoObj);
        if (errors.length > 0) {
            const messages = errors.map(err => Object.values(err.constraints || {}).join(", "));
            res.status(400).json({ errors: messages });
            return;
        }
        next();
    };
}
