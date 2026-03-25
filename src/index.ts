// src/index.ts
import "reflect-metadata"; // [IMPORTANTE]: DEBE SER LA PRIMERA LÍNEA
import { InversifyExpressServer } from "inversify-express-utils";
import { container } from "./container";
import express from "express";
import { initDb } from "./infrastructure/db/postgres";

// Crear servidor con el contenedor configurado
const server = new InversifyExpressServer(container);

server.setConfig((app) => {
    app.use(express.json()); // Parsear JSON
    // Configuración de endpoint de salud (health check) para Kubernetes
    app.get("/health", (req, res) => {
        res.status(200).send({ status: "OK", timestamp: new Date() });
    });
    // Aquí puedes agregar cors, helmet, morgan, etc.
});

const app = server.build();
const PORT = 3000;
const HOST = '0.0.0.0'; // [NUEVO]: Definimos el host para que sea accesible externamente

// Inicializamos base de datos y luego levantamos servidor
initDb().then(() => {
    app.listen(PORT, HOST, () => {
        console.log(`🚀 Servidor corriendo en http://${HOST}:${PORT}`);
    });
}).catch((err) => {
    console.error("No se pudo conectar a la base de datos:", err);
    process.exit(1);
});