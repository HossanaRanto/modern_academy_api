# API Quick Start Guide

## ✅ What's Been Implemented

### 1. Authentication System (JWT)
- **Sign Up** - Register new users
- **Sign In** - Login with JWT token
- Password hashing with bcrypt
- JWT authentication guard for protected routes

### 2. Academy Management
- **Create Academy** - Users can create their academy (protected route)
- **Get Academy** - Retrieve academy details (protected route)
- Automatic linking of user to academy

### 3. Hexagonal Architecture
```
✓ Domain Layer - Business logic and interfaces
✓ Application Layer - Use cases and ports
✓ Infrastructure Layer - Adapters, controllers, DTOs
```

## 🚀 Getting Started

### 1. Setup Environment
```bash
# Copy environment example
cp .env.example .env

# Edit .env with your database credentials
```

### 2. Install Dependencies (Already done)
```bash
npm install
```

### 3. Run Migrations
```bash
npm run build
npm run migration:run
```

### 4. Start the Server
```bash
npm run start:dev
```

## 📡 Test the API

### Sign Up (Create Account)
```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

Response includes JWT token:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "super_admin"
  }
}
```

### Sign In (Login)
```bash
curl -X POST http://localhost:3000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Create Academy (Protected - needs JWT)
```bash
curl -X POST http://localhost:3000/academies \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Modern Academy",
    "code": "MA001",
    "address": "123 Main St",
    "phone": "+1234567890",
    "email": "info@academy.com"
  }'
```

### Get Academy
```bash
curl -X GET http://localhost:3000/academies/ACADEMY_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🏗️ Architecture Highlights

### Hexagonal Architecture Benefits:
- ✅ **Testable** - Business logic independent of frameworks
- ✅ **Flexible** - Easy to swap implementations
- ✅ **Maintainable** - Clear separation of concerns
- ✅ **Scalable** - Easy to extend with new features

### Key Components:
- **Ports** - Interfaces defining contracts
- **Adapters** - Implementations (Repository, Password Hasher)
- **Use Cases** - Business logic operations
- **DTOs** - Data validation with class-validator
- **Guards** - Route protection with JWT

## 🔒 Security Features
- ✅ Password hashing (bcrypt)
- ✅ JWT authentication
- ✅ Protected routes
- ✅ Input validation
- ✅ Role-based access (SUPER_ADMIN, ADMIN, TEACHER, STAFF)

## 📁 Project Structure
```
src/
├── modules/
│   ├── auth/           # Authentication module
│   │   ├── domain/     # Interfaces and types
│   │   ├── application/
│   │   │   ├── ports/  # Interface contracts
│   │   │   └── use-cases/ # SignUp, SignIn
│   │   └── infrastructure/
│   │       ├── adapters/   # Repository, Hasher
│   │       ├── controllers/ # HTTP endpoints
│   │       ├── dtos/       # Validation
│   │       └── strategies/ # JWT strategy
│   └── academy/        # Academy module
│       └── [same structure]
├── entities/           # TypeORM entities
└── shared/
    ├── decorators/     # @CurrentUser()
    └── guards/         # JwtAuthGuard
```

## 🎯 Next Steps

You can now:
1. ✅ Sign up users
2. ✅ Sign in and get JWT tokens
3. ✅ Create academies for users
4. ✅ Retrieve academy information

For more details, see AUTH_README.md
