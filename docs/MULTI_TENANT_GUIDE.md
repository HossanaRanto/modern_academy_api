# Multi-Tenant Architecture Guide

## 🏢 Overview

This API implements a **multi-tenant SaaS architecture** where each academy functions as an isolated tenant. Data is strictly segregated between academies, ensuring complete privacy and security.

## 🏗️ Architecture Components

### 1. Tenant Identification
- **Tenant ID**: Academy UUID (`academyId`)
- **Source**: JWT token payload (extracted from authenticated user)
- **Scope**: All tenant-specific resources are filtered by academy ID

### 2. Tenant Linking Patterns

#### Pattern A: Direct Academy Link
Used for entities that are directly owned by an academy.

**Examples**: Courses, Teachers, Classes, Academic Years

```
Entity → Academy (direct FK relationship)
```

#### Pattern B: Indirect Academy Link
Used for entities that can exist across multiple academies through relationships.

**Example**: Students

```
Student → StudentInscription → AcademicYear → Academy
```

**Why?** A student record can theoretically be enrolled in multiple academies across different years. The `StudentInscription` acts as the enrollment record linking a student to a specific academy through an academic year.

### 2. Key Components

#### Guards
- **`JwtAuthGuard`**: Validates JWT token and authenticates user
- **`TenantGuard`**: Ensures user has an academy before accessing tenant resources

#### Decorators
- **`@TenantRequired()`**: Marks controller/route as tenant-specific
- **`@TenantId()`**: Injects current tenant ID into route handler
- **`@CurrentUser()`**: Injects authenticated user payload

#### Interceptors
- **`TenantInterceptor`**: Automatically injects tenant context into requests

#### Utilities
- **`withTenantFilter()`**: Helper to add tenant filters to queries
- **`validateTenantOwnership()`**: Ensures entity belongs to correct tenant

## 🔐 Access Control Levels

### Level 1: Public Routes
No authentication required.

**Example**: Health check endpoints

### Level 2: Authenticated Routes
Requires valid JWT token.

**Example**: 
- User signup/signin
- Create academy
- Get academy details

```typescript
@Controller('academies')
@UseGuards(JwtAuthGuard)
export class AcademyController {
  // Routes here require authentication only
}
```

### Level 3: Tenant-Specific Routes
Requires JWT token + academy membership.

**Example**:
- Student management
- Course management
- Class management

```typescript
@Controller('students')
@UseGuards(JwtAuthGuard, TenantGuard)
@TenantRequired()
export class StudentController {
  // Routes here require tenant membership
}
```

## 📊 Data Flow

### Creating Tenant-Aware Resources

```typescript
// 1. User makes authenticated request
POST /students
Authorization: Bearer <jwt-token>
Body: { firstName: "John", lastName: "Doe" }

// 2. JwtAuthGuard validates token
// 3. TenantGuard checks if user.academyId exists
// 4. TenantId decorator extracts academyId
// 5. Repository automatically filters by academyId

async createStudent(@Body() dto: CreateStudentDto, @TenantId() tenantId: string) {
  // tenantId is automatically injected from user's academy
  return this.createStudentUseCase.execute(dto, tenantId);
}
```

### Querying Tenant-Aware Resources

```typescript
// Repository automatically filters by tenant
async findAll(tenantId: string): Promise<Student[]> {
  return this.studentRepository.find({
    where: { academyId: tenantId }, // Tenant filter
    order: { createdAt: 'DESC' },
  });
}
```

### Preventing Cross-Tenant Access

```typescript
async findById(id: string, tenantId: string): Promise<Student | null> {
  const student = await this.studentRepository.findOne({
    where: { id, academyId: tenantId }, // Double filter
  });

  // Extra validation
  if (student) {
    validateTenantOwnership(student, tenantId, 'Student');
  }

  return student;
}
```

## 🛠️ Implementing New Tenant-Aware Modules

### Step 1: Entity Design

**Option A: Direct Academy Link** (for entities directly owned by academy)
```typescript
@Entity('your_entities')
export class YourEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  academyId: string;

  @ManyToOne(() => Academy)
  @JoinColumn({ name: 'academyId' })
  academy: Academy;

  // Other fields...
}
```

**Option B: Indirect Link** (like Students through inscriptions)
```typescript
// Student entity doesn't have academyId
// It's linked through: Student → StudentInscription → AcademicYear → Academy

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToMany(() => StudentInscription, (inscription) => inscription.student)
  inscriptions: StudentInscription[];
  
  // No academyId field needed
}
```

### Step 2: Repository Implementation

**Pattern A: Direct Link** - Simple filtering
```typescript
@Injectable()
export class YourRepositoryAdapter implements IYourRepository {
  async findAll(tenantId: string): Promise<YourEntity[]> {
    return this.repository.find({
      where: { academyId: tenantId },
    });
  }

  async create(data: Partial<YourEntity>, tenantId: string): Promise<YourEntity> {
    const entity = this.repository.create({
      ...data,
      academyId: tenantId, // Always set tenant
    });
    return this.repository.save(entity);
  }
}
```

**Pattern B: Indirect Link** - Join through relationships
```typescript
@Injectable()
export class StudentRepositoryAdapter implements IStudentRepository {
  async findAll(tenantId: string): Promise<Student[]> {
    // Query through relationship chain
    return this.repository
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.inscriptions', 'inscription')
      .leftJoinAndSelect('inscription.academicYear', 'academicYear')
      .where('academicYear.academyId = :tenantId', { tenantId })
      .getMany();
  }

  async create(data: Partial<Student>, tenantId: string): Promise<Student> {
    // Student doesn't have academyId
    const student = this.repository.create(data);
    // After save, create StudentInscription to link to academy
    return this.repository.save(student);
  }
}
```

### Step 3: Controller Setup
Apply guards and decorators:

```typescript
@ApiTags('Your Module (Tenant-Specific)')
@ApiBearerAuth()
@Controller('your-module')
@UseGuards(JwtAuthGuard, TenantGuard)
@TenantRequired()
export class YourController {
  @Get()
  async getAll(@TenantId() tenantId: string) {
    return this.useCase.execute(tenantId);
  }

  @Post()
  async create(
    @Body() dto: CreateDto,
    @TenantId() tenantId: string,
  ) {
    return this.useCase.execute(dto, tenantId);
  }
}
```

## 🔒 Security Best Practices

### 1. Always Filter by Tenant

**Direct Link Entities:**
```typescript
// ✅ GOOD
const courses = await this.repository.find({
  where: { academyId: tenantId, isActive: true }
});

// ❌ BAD - Missing tenant filter
const courses = await this.repository.find({
  where: { isActive: true } // Can access other tenants!
});
```

**Indirect Link Entities:**
```typescript
// ✅ GOOD - Query through relationship
const students = await this.repository
  .createQueryBuilder('student')
  .leftJoin('student.inscriptions', 'inscription')
  .leftJoin('inscription.academicYear', 'academicYear')
  .where('academicYear.academyId = :tenantId', { tenantId })
  .getMany();

// ❌ BAD - No tenant filter at all
const students = await this.repository.find();
```

### 2. Validate Ownership
```typescript
// ✅ GOOD
const student = await this.findById(id, tenantId);
validateTenantOwnership(student, tenantId, 'Student');

// ❌ BAD - No validation
const student = await this.findById(id);
```

### 3. Use Helper Functions
```typescript
// Use withTenantFilter helper
const where = withTenantFilter(tenantId, { 
  isActive: true,
  grade: 'A'
});

const students = await this.repository.find({ where });
```

### 4. Protect Relationships
```typescript
// When querying related entities, ensure tenant filter
const classes = await this.repository.find({
  where: { academyId: tenantId },
  relations: ['students'], // Relations must also belong to tenant
});
```

## 🧪 Testing Multi-Tenancy

### Test Tenant Isolation
```typescript
describe('Tenant Isolation', () => {
  it('should not access other tenant data', async () => {
    // Create student in tenant A
    const studentA = await createStudent(dto, tenantIdA);

    // Try to access from tenant B
    await expect(
      getStudent(studentA.id, tenantIdB)
    ).rejects.toThrow('Access denied');
  });
});
```

## 📋 Checklist for New Tenant-Aware Features

- [ ] Entity has `academyId` field
- [ ] Entity has relationship to Academy
- [ ] Repository filters by `tenantId` in all queries
- [ ] Repository sets `academyId` when creating entities
- [ ] Controller uses `@UseGuards(JwtAuthGuard, TenantGuard)`
- [ ] Controller uses `@TenantRequired()` decorator
- [ ] Routes use `@TenantId()` to inject tenant
- [ ] Swagger documentation includes tenant-specific tag
- [ ] Update operations validate tenant ownership
- [ ] Delete operations validate tenant ownership
- [ ] Tests verify tenant isolation

## 🎯 User Journey

### 1. Initial Setup (First User)
```bash
# Sign up
POST /auth/signup
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "secure123"
}
# Response: { accessToken: "...", user: { id, role: "super_admin", academyId: null }}
```

### 2. Create Academy (Become Tenant)
```bash
# Create academy
POST /academies
Authorization: Bearer <token>
{
  "name": "John's Academy",
  "code": "JA001"
}
# Response: { id: "academy-uuid", ... }
# User now has academyId in JWT
```

### 3. Access Tenant Resources
```bash
# Sign in again to get updated token with academyId
POST /auth/signin
{
  "email": "john@example.com",
  "password": "secure123"
}
# New token includes academyId

# Now can access tenant resources
GET /students
Authorization: Bearer <new-token>
# Returns only students from your academy
```

## 🚀 Benefits

1. **Data Isolation**: Complete separation between academies
2. **Security**: Cannot access other tenant's data
3. **Scalability**: Add tenants without code changes
4. **Simplicity**: Tenant context automatically injected
5. **Flexibility**: Easy to add new tenant-aware features

## 📚 Related Files

- Guards: `src/shared/guards/tenant.guard.ts`
- Decorators: `src/shared/decorators/tenant-*.decorator.ts`
- Interceptor: `src/shared/interceptors/tenant.interceptor.ts`
- Utilities: `src/shared/utils/tenant.util.ts`
- Example Module: `src/modules/students/`

## 🔄 Migration Path

For existing modules that need to become tenant-aware:

1. Add `academyId` column to database table
2. Add migration to set `academyId` for existing records
3. Update entity with `academyId` field
4. Update repository to filter by tenant
5. Update controller with tenant guards
6. Update tests for tenant isolation
7. Update Swagger documentation
