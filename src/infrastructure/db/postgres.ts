import { Pool } from 'pg';

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'api_db',
    port: parseInt(process.env.DB_PORT || '5432', 10),
});

pool.on('error', (err: Error, client: any) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

export const initDb = async () => {
    const client = await pool.connect();
    try {
        await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL
      );
    `);
        console.log("💾 Base de datos PostgreSQL lista y tabla 'users' asegurada.");
    } catch (error) {
        console.error("Error inicializando base de datos", error);
        throw error;
    } finally {
        client.release();
    }
};

export default pool;
