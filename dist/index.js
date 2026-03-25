"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/index.ts
require("reflect-metadata"); // [IMPORTANTE]: DEBE SER LA PRIMERA LÍNEA
const inversify_express_utils_1 = require("inversify-express-utils");
const container_1 = require("./container");
const express_1 = __importDefault(require("express"));
const postgres_1 = require("./infrastructure/db/postgres");
// Crear servidor con el contenedor configurado
const server = new inversify_express_utils_1.InversifyExpressServer(container_1.container);
server.setConfig((app) => {
    app.use(express_1.default.json()); // Parsear JSON
    // Aquí puedes agregar cors, helmet, morgan, etc.
});
const app = server.build();
const PORT = 3000;
// Inicializamos base de datos y luego levantamos servidor
(0, postgres_1.initDb)().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
}).catch((err) => {
    console.error("No se pudo conectar a la base de datos:", err);
    process.exit(1);
});
