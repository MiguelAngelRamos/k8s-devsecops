# API Node.js con TypeScript

API REST desarrollada con Node.js, TypeScript y Express que implementa autenticación de usuarios siguiendo principios SOLID y arquitectura limpia.

##  Descripción

Esta API proporciona un sistema de autenticación de usuarios con las siguientes características:

- **Registro de usuarios** con validación de datos
- **Encriptación de contraseñas** usando bcrypt
- **Generación de JWT** para autenticación
- **Base de datos SQLite** para persistencia
- **Inyección de dependencias** con InversifyJS
- **Validación de DTOs** con class-validator
- **Arquitectura limpia** siguiendo principios SOLID

##  Requisitos Previos

- Node.js (v14 o superior)
- npm o yarn

##  Instalación

1. Clona el repositorio:
```bash
git clone <url-del-repositorio>
cd api-node-ts
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno (opcional):
Crea un archivo `.env` en la raíz del proyecto para configurar el secreto JWT y otros parámetros.

## 🏃‍♂️ Ejecución

### Modo desarrollo
```bash
npm run dev
```

El servidor se ejecutará en `http://localhost:3000`

##  Estructura del Proyecto

```
api-node-ts/
├── src/
│   ├── config/
│   │   └── types.ts                    # Tipos para inyección de dependencias
│   ├── controllers/
│   │   └── AuthController.ts           # Controlador de autenticación
│   ├── domain/
│   │   ├── entities/
│   │   │   └── User.ts                 # Entidad de usuario
│   │   └── interfaces/
│   │       └── IUserRepository.ts      # Interfaz del repositorio
│   ├── dtos/
│   │   └── RegisterDto.ts              # DTO de registro con validaciones
│   ├── infrastructure/
│   │   ├── db/
│   │   │   └── database.ts             # Configuración de SQLite
│   │   └── repositories/
│   │       └── SQLiteUserRepository.ts # Implementación del repositorio
│   ├── middlewares/
│   │   └── ValidateDto.ts              # Middleware de validación
│   ├── services/
│   │   └── AuthService.ts              # Lógica de negocio de autenticación
│   ├── container.ts                     # Configuración de InversifyJS
│   └── index.ts                         # Punto de entrada de la aplicación
├── package.json
├── tsconfig.json
└── README.md
```

## Tecnologías Utilizadas

- **Node.js** - Entorno de ejecución
- **TypeScript** - Lenguaje de programación
- **Express** - Framework web
- **InversifyJS** - Contenedor de inyección de dependencias
- **better-sqlite3** - Base de datos SQLite
- **bcryptjs** - Encriptación de contraseñas
- **jsonwebtoken** - Generación de tokens JWT
- **class-validator** - Validación de objetos
- **class-transformer** - Transformación de objetos

## 🔌 Endpoints

### POST /auth/register

Registra un nuevo usuario en el sistema.

**Request Body:**
```json
{
  "email": "usuario@example.com",
  "password": "contraseña123",
  "name": "Nombre Usuario"
}
```

**Validaciones:**
- `email`: Debe ser un email válido
- `password`: Mínimo 6 caracteres
- `name`: Mínimo 2 caracteres

**Response (201 Created):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1733123456789",
    "email": "usuario@example.com",
    "name": "Nombre Usuario"
  }
}
```

**Response (400 Bad Request):**
```json
{
  "error": "El usuario ya existe"
}
```

## Arquitectura

Este proyecto sigue los principios SOLID:

### Single Responsibility Principle (SRP)
- Cada clase tiene una única responsabilidad
- `User.ts`: Define la entidad
- `RegisterDto.ts`: Valida datos de entrada
- `AuthService.ts`: Lógica de negocio

### Open/Closed Principle (OCP)
- Las entidades están abiertas a extensión pero cerradas a modificación

### Liskov Substitution Principle (LSP)
- `SQLiteUserRepository` implementa `IUserRepository` y puede ser sustituido por cualquier otra implementación

### Interface Segregation Principle (ISP)
- Interfaces específicas y no monolíticas

### Dependency Inversion Principle (DIP)
- Las dependencias se inyectan a través de interfaces
- `AuthService` depende de `IUserRepository`, no de la implementación concreta

## Ejemplos de Uso

### Registrar un usuario con cURL:
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### Registrar un usuario con JavaScript:
```javascript
fetch('http://localhost:3000/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User'
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

## Seguridad

- Las contraseñas se almacenan encriptadas usando bcrypt con un salt de 10 rondas
- Se generan tokens JWT con expiración de 1 hora
- Se validan todos los datos de entrada usando class-validator

## Notas Importantes

**Cambiar el secreto JWT**: El secreto JWT está hardcodeado en `AuthService.ts`. En producción, debe moverse a variables de entorno.

 **Base de datos**: La API usa SQLite. Asegúrate de que la base de datos esté inicializada con la tabla `users` antes de ejecutar.

## Próximas Funcionalidades

- [ ] Endpoint de login
- [ ] Refresh tokens
- [ ] Middleware de autenticación JWT
- [ ] CRUD de usuarios
- [ ] Tests unitarios e integración
- [ ] Variables de entorno con dotenv
- [ ] Documentación con Swagger
- [ ] Rate limiting
- [ ] CORS configurado

## Desarrollo

Este proyecto usa:
- **nodemon** para desarrollo en caliente
- **ts-node** para ejecutar TypeScript directamente
- **TypeScript** para tipado estático

## 📄 Licencia

MIT

---

## 👨‍💻 Autor

**Miguel Ángel Ramos**

[![GitHub](https://img.shields.io/badge/GitHub-MiguelAngelRamos-181717?style=for-the-badge&logo=github)](https://github.com/MiguelAngelRamos)

Desarrollado con usando Node.js y TypeScript
