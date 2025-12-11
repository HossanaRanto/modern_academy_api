# Academic Year Header System

This document explains how the `X-Academic-Year-ID` header system works for managing academic year context in API requests.

## Overview

The Modern Academy API uses an HTTP header-based approach to allow users to work with specific academic years or automatically use the current academic year.

## Header Format

```
X-Academic-Year-ID: <academic-year-uuid>
```

## How It Works

### 1. Optional Header Usage

By default, the `X-Academic-Year-ID` header is optional on most endpoints. If not provided:
- The system automatically uses the **current academic year** (the one marked with `isCurrent: true`)
- If no current academic year exists, the request may fail depending on the endpoint

### 2. Required Header Usage

Some endpoints require an academic year context and use the `@RequireAcademicYear()` decorator:
- If the header is missing, the system falls back to the current academic year
- If no current academic year exists and the header is missing, a `400 Bad Request` is returned

### 3. Accessing the Academic Year in Code

Use the `@CurrentAcademicYear()` decorator to access the academic year ID in your controllers:

```typescript
@Get('students')
@UseGuards(AcademicYearGuard)
@RequireAcademicYear()
async getStudents(
  @CurrentAcademicYear() academicYearId: string,
  @TenantId() tenantId: string,
) {
  // academicYearId is automatically resolved from header or current year
}
```

## Implementation

### Guards

The `AcademicYearGuard` validates the academic year:

1. Extracts the `X-Academic-Year-ID` header value
2. If present, validates it belongs to the user's academy
3. If missing and `@RequireAcademicYear()` is used, fetches the current academic year
4. Attaches the academic year ID to `request.academicYearId`

### Decorators

#### `@RequireAcademicYear()`
Marks endpoints that require an academic year context:
- Applied at the method level
- Triggers fallback to current year if header is missing
- Returns error if no current year exists

```typescript
@Get('inscriptions')
@RequireAcademicYear()
async getInscriptions(@CurrentAcademicYear() academicYearId: string) {
  // ...
}
```

#### `@CurrentAcademicYear()`
Extracts the academic year ID from the request:
- Gets the value set by `AcademicYearGuard`
- Returns the academic year UUID

```typescript
@Post('students')
async createStudent(
  @CurrentAcademicYear() academicYearId: string,
  @Body() dto: CreateStudentDto,
) {
  // ...
}
```

## API Examples

### Example 1: Using a Specific Academic Year

```bash
curl -X GET http://localhost:3000/api/students \
  -H "Authorization: Bearer <jwt-token>" \
  -H "X-Academy-ID: <academy-uuid>" \
  -H "X-Academic-Year-ID: 550e8400-e29b-41d4-a716-446655440005"
```

### Example 2: Using the Current Academic Year (implicit)

```bash
curl -X GET http://localhost:3000/api/students \
  -H "Authorization: Bearer <jwt-token>" \
  -H "X-Academy-ID: <academy-uuid>"
# No X-Academic-Year-ID header - system uses current year automatically
```

### Example 3: Creating an Academic Year

```bash
curl -X POST http://localhost:3000/api/academies/academic-years \
  -H "Authorization: Bearer <jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "2024-2025",
    "startDate": "2024-09-01",
    "endDate": "2025-06-30"
  }'
```

### Example 4: Setting Current Academic Year

```bash
curl -X PATCH http://localhost:3000/api/academies/academic-years/550e8400-e29b-41d4-a716-446655440005/set-current \
  -H "Authorization: Bearer <jwt-token>"
```

## Workflow

### Initial Setup

1. User signs up and creates an academy
2. User creates the first academic year
3. System marks it as `isCurrent: true` automatically (first year)

### Normal Operations

1. User can switch between academic years using the header
2. Without the header, operations use the current year
3. User can change the current year via `PATCH /academic-years/:id/set-current`

### Multi-Year Operations

When working with data from different academic years:

```bash
# View students from 2023-2024
curl -X GET http://localhost:3000/api/students \
  -H "X-Academic-Year-ID: <2023-2024-uuid>"

# View students from 2024-2025
curl -X GET http://localhost:3000/api/students \
  -H "X-Academic-Year-ID: <2024-2025-uuid>"
```

## Security

### Validation Rules

1. **Tenant Isolation**: Academic year must belong to the user's academy
2. **UUID Format**: Header value must be a valid UUID
3. **Existence Check**: Academic year must exist in the database
4. **Current Year Fallback**: Only used if explicitly allowed by `@RequireAcademicYear()`

### Error Responses

```typescript
// Invalid academic year ID
{
  "statusCode": 400,
  "message": "Invalid academic year ID format",
  "error": "Bad Request"
}

// Academic year not found or doesn't belong to academy
{
  "statusCode": 403,
  "message": "Academic year does not belong to your academy",
  "error": "Forbidden"
}

// No current year and header missing
{
  "statusCode": 400,
  "message": "No current academic year set and no X-Academic-Year-ID header provided",
  "error": "Bad Request"
}
```

## Best Practices

### For Frontend Developers

1. **Store the current academic year ID** after fetching it from the API
2. **Allow users to switch** academic years via a dropdown/selector
3. **Include the header** on all requests when a specific year is selected
4. **Handle 400/403 errors** gracefully and prompt user to select an academic year

### For Backend Developers

1. **Always use `@CurrentAcademicYear()`** instead of manually extracting headers
2. **Apply `@RequireAcademicYear()`** on endpoints that need academic year context
3. **Use `AcademicYearGuard`** to ensure proper validation
4. **Filter by academic year** in all queries that deal with year-specific data

## Database Schema

```typescript
@Entity('academic_years')
export class AcademicYear {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ default: false })
  isCurrent: boolean; // Only one can be true per academy

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Academy)
  @JoinColumn({ name: 'academyId' })
  academy: Academy;

  @Column()
  academyId: string;
}
```

## Swagger Documentation

The `X-Academic-Year-ID` header is automatically documented in Swagger:

```typescript
@ApiHeader({
  name: 'X-Academic-Year-ID',
  description: 'Optional: Academic Year ID. If not provided, uses the current academic year.',
  required: false,
  schema: { type: 'string', format: 'uuid' },
})
```

Test it in Swagger UI:
1. Authorize with JWT token
2. Add `X-Academic-Year-ID` header in the request
3. Execute the request

## Related Documentation

- [Multi-Tenant Guide](./MULTI_TENANT_GUIDE.md) - Understanding tenant isolation
- [Tenant Relationships](./TENANT_RELATIONSHIPS.md) - Entity relationship patterns
- [TypeORM Migrations](./TYPEORM_MIGRATIONS.md) - Database migrations

## Troubleshooting

### Issue: "No current academic year set"

**Solution**: Create an academic year and mark it as current:

```bash
# Create academic year
POST /academies/academic-years
{
  "name": "2024-2025",
  "startDate": "2024-09-01",
  "endDate": "2025-06-30"
}

# Set as current
PATCH /academies/academic-years/:id/set-current
```

### Issue: "Academic year does not belong to your academy"

**Cause**: Attempting to access another academy's academic year

**Solution**: Use only academic year IDs that belong to your academy

### Issue: Header not working

**Checklist**:
1. Verify header name is exactly `X-Academic-Year-ID` (case-sensitive)
2. Ensure value is a valid UUID
3. Confirm academic year exists and belongs to your academy
4. Check that `AcademicYearGuard` is applied to the endpoint
