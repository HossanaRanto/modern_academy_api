# Authentication & Academy Management API

This API implements JWT-based authentication and academy management using **Hexagonal Architecture** (Ports & Adapters).

## 🏗️ Architecture

The project follows Hexagonal Architecture principles:

```
src/
├── modules/
│   ├── auth/
│   │   ├── domain/              # Business entities and interfaces
│   │   ├── application/
│   │   │   ├── ports/          # Interfaces for external dependencies
│   │   │   └── use-cases/      # Business logic (SignUp, SignIn)
│   │   └── infrastructure/
│   │       ├── adapters/       # Implementations (Repository, Password Hasher)
│   │       ├── controllers/    # HTTP endpoints
│   │       ├── dtos/           # Data Transfer Objects
│   │       └── strategies/     # JWT Strategy
│   └── academy/
│       ├── domain/
│       ├── application/
│       │   ├── ports/
│       │   └── use-cases/      # CreateAcademy, GetAcademy
│       └── infrastructure/
│           ├── adapters/
│           ├── controllers/
│           └── dtos/
├── entities/                    # TypeORM entities
└── shared/                      # Shared utilities
    ├── decorators/
    └── guards/
```

## 🚀 Features

### Authentication Module
- ✅ Sign Up (User Registration)
- ✅ Sign In (Login with JWT)
- ✅ JWT Authentication Guard
- ✅ Password Hashing (bcrypt)
- ✅ Role-based access control

### Academy Module
- ✅ Create Academy (Protected route)
- ✅ Get Academy details
- ✅ Link user to academy

## 📋 Prerequisites

- Node.js (v18 or higher)
- MySQL or PostgreSQL
- npm or yarn

## 🔧 Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your database credentials and JWT secret.

3. Run database migrations:
```bash
npm run build
npm run migration:run
```

## 🏃 Running the Application

Development mode:
```bash
npm run start:dev
```

Production mode:
```bash
npm run build
npm run start:prod
```

## 📡 API Endpoints

### Authentication

#### Sign Up
```http
POST /auth/signup
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890"  // optional
}
```

Response:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "super_admin",
    "academyId": null
  }
}
```

#### Sign In
```http
POST /auth/signin
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

Response: Same as Sign Up

### Academy Management

#### Create Academy (Protected)
```http
POST /academies
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "name": "Modern Academy",
  "code": "MA001",
  "address": "123 Main St",
  "phone": "+1234567890",
  "email": "info@modernacademy.com"
}
```

Response:
```json
{
  "id": "uuid",
  "name": "Modern Academy",
  "code": "MA001",
  "address": "123 Main St",
  "phone": "+1234567890",
  "email": "info@modernacademy.com",
  "isActive": true,
  "createdAt": "2025-12-11T...",
  "updatedAt": "2025-12-11T..."
}
```

#### Get Academy (Protected)
```http
GET /academies/:id
Authorization: Bearer <your-jwt-token>
```

## 🏛️ Hexagonal Architecture Benefits

1. **Independence from frameworks**: Business logic doesn't depend on NestJS
2. **Testability**: Easy to test use cases independently
3. **Flexibility**: Easy to swap implementations (e.g., change from MySQL to PostgreSQL)
4. **Maintainability**: Clear separation of concerns

### Layers:

- **Domain**: Pure business logic and entities
- **Application**: Use cases and port interfaces
- **Infrastructure**: Technical implementations (controllers, adapters, database)

## 🧪 Testing

Run tests:
```bash
npm run test
```

E2E tests:
```bash
npm run test:e2e
```

## 🔒 Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Protected routes with guards
- Input validation with class-validator
- Role-based access control

## 📝 User Roles

- `SUPER_ADMIN`: Full system access (first user)
- `ADMIN`: Academy administrator
- `TEACHER`: Teaching staff
- `STAFF`: General staff members

## 🗄️ Database Schema

Key entities:
- **User**: Users with roles and authentication
- **Academy**: Educational institutions
- Relationship: User belongs to Academy (optional)

## 🚧 Next Steps

- Implement role-based guards
- Add refresh token functionality
- Implement password reset
- Add email verification
- Extend academy management features
- Add more modules (students, courses, etc.)

## 📚 Learn More

- [NestJS Documentation](https://docs.nestjs.com/)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [JWT Authentication](https://jwt.io/)
