# Multi-Tenant Quick Reference

## 🚀 Quick Start

### 1. Test Authentication Flow
```bash
# Sign Up
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "password123"
  }'

# Save the accessToken from response
```

### 2. Create Your Academy (Tenant)
```bash
# Create Academy
curl -X POST http://localhost:3000/academies \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "My Academy",
    "code": "MAC001",
    "address": "123 Street",
    "phone": "+1234567890",
    "email": "info@myacademy.com"
  }'
```

### 3. Sign In Again (Get Updated Token with Academy ID)
```bash
# Sign in to get token with academyId
curl -X POST http://localhost:3000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'

# Save this NEW token - it includes your academyId
```

### 4. Access Tenant Resources
```bash
# Create Student (Tenant-Specific)
curl -X POST http://localhost:3000/students \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_NEW_TOKEN" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    "phone": "+1234567890"
  }'

# Get All Students (Only from your academy)
curl -X GET http://localhost:3000/students \
  -H "Authorization: Bearer YOUR_NEW_TOKEN"
```

## 📊 Swagger UI Access

1. Start the server: `npm run start:dev`
2. Open browser: `http://localhost:3000/api/docs`
3. Click **Authorize** button (top right)
4. Enter: `Bearer YOUR_ACCESS_TOKEN`
5. Try endpoints directly in the UI

## 🏗️ Module Types

### Public Endpoints (No Auth)
- Health checks
- Public information

### Authenticated Endpoints (JWT Required)
- `POST /auth/signup`
- `POST /auth/signin`
- `POST /academies` - Create academy
- `GET /academies/:id` - Get academy

### Tenant-Specific Endpoints (JWT + Academy Required)
- `POST /students` - Create student in your academy
- `GET /students` - Get students from your academy
- `GET /students/:id` - Get specific student (must be from your academy)

## 🔐 Understanding Tenant Isolation

### What Happens Behind the Scenes

```
User Request → JwtAuthGuard → TenantGuard → TenantInterceptor → Controller
                    ↓              ↓               ↓
              Validates JWT   Checks academyId   Injects tenantId
```

### Data Isolation Example

```typescript
// Academy A creates a student
POST /students
Token: { userId: "user-1", academyId: "academy-a" }
Body: { firstName: "John" }
→ Student created with academyId: "academy-a"

// Academy B tries to access
GET /students/{john-id}
Token: { userId: "user-2", academyId: "academy-b" }
→ 403 Forbidden: Student belongs to different academy
```

## 🛠️ Creating New Tenant-Aware Modules

### Quick Template

```typescript
// 1. Update Entity (e.g., course.entity.ts)
@Entity('courses')
export class Course {
  @Column({ type: 'uuid' })
  academyId: string;

  @ManyToOne(() => Academy)
  @JoinColumn({ name: 'academyId' })
  academy: Academy;
}

// 2. Repository (always filter by tenant)
async findAll(tenantId: string): Promise<Course[]> {
  return this.repository.find({
    where: { academyId: tenantId } as any,
  });
}

// 3. Controller (apply guards)
@Controller('courses')
@UseGuards(JwtAuthGuard, TenantGuard)
@TenantRequired()
export class CourseController {
  @Get()
  async getAll(@TenantId() tenantId: string) {
    return this.useCase.execute(tenantId);
  }
}
```

## ✅ Verification Checklist

Before deploying tenant-aware features:

- [ ] Entity has `academyId` field
- [ ] All queries filter by `tenantId`
- [ ] Controller uses `JwtAuthGuard` and `TenantGuard`
- [ ] Controller uses `@TenantRequired()` decorator
- [ ] Swagger docs show "Tenant-Specific" tag
- [ ] Tests verify cross-tenant access is blocked
- [ ] Update/Delete operations validate ownership

## 🧪 Testing Multi-Tenancy

```typescript
// Test in your e2e tests
describe('Multi-Tenant Isolation', () => {
  it('cannot access other tenant data', async () => {
    // Create data in tenant A
    const studentA = await createStudent(tenantA);
    
    // Try to access from tenant B
    const response = await request(app)
      .get(`/students/${studentA.id}`)
      .set('Authorization', `Bearer ${tenantBToken}`);
    
    expect(response.status).toBe(403);
  });
});
```

## 📈 Performance Tips

1. **Add database indexes on academyId**
```sql
CREATE INDEX idx_students_academy ON students(academy_id);
CREATE INDEX idx_courses_academy ON courses(academy_id);
```

2. **Use eager/lazy loading wisely**
```typescript
// Don't load all relations for list views
@Get()
async getAll(@TenantId() tenantId: string) {
  return this.repository.find({
    where: { academyId: tenantId },
    select: ['id', 'firstName', 'lastName'], // Only needed fields
  });
}
```

3. **Paginate tenant data**
```typescript
async findAll(tenantId: string, page: number, limit: number) {
  return this.repository.find({
    where: { academyId: tenantId },
    skip: (page - 1) * limit,
    take: limit,
  });
}
```

## 🚨 Common Pitfalls

### ❌ DON'T: Forget tenant filter
```typescript
// BAD - Returns all students from all academies!
const students = await this.repository.find();
```

### ✅ DO: Always filter by tenant
```typescript
// GOOD - Returns only tenant's students
const students = await this.repository.find({
  where: { academyId: tenantId },
});
```

### ❌ DON'T: Trust client-provided tenantId
```typescript
// BAD - User could pass any academyId
@Post()
async create(@Body() dto: { academyId: string }) {
  return this.service.create(dto.academyId);
}
```

### ✅ DO: Extract from JWT token
```typescript
// GOOD - TenantId comes from authenticated token
@Post()
async create(@Body() dto: CreateDto, @TenantId() tenantId: string) {
  return this.service.create(dto, tenantId);
}
```

## 📞 Support

- Full Guide: `MULTI_TENANT_GUIDE.md`
- Auth Guide: `AUTH_README.md`
- Swagger UI: `http://localhost:3000/api/docs`

## 🎯 Next Steps

1. Add more tenant-aware modules (Courses, Classes, Teachers)
2. Implement role-based permissions within tenants
3. Add tenant-specific settings/configurations
4. Implement tenant usage analytics
5. Add multi-tenant database migration tools
