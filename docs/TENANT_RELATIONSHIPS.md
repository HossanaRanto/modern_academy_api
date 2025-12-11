# Multi-Tenant Data Model Relationships

## 📊 Entity Relationship Diagram

```
┌─────────────────┐
│     Academy     │ (Tenant Root)
│  id, name, code │
└────────┬────────┘
         │
         │ 1:N (Direct Link)
         ▼
┌─────────────────┐
│  Academic Year  │
│ id, academyId   │
└────────┬────────┘
         │
         │ 1:N
         ▼
┌──────────────────────┐
│ Student Inscription  │ (Enrollment Record)
│ id, studentId,       │
│ academicYearId       │
└──────────┬───────────┘
           │
           │ N:1 (Indirect Link to Academy)
           ▼
    ┌──────────────┐
    │   Student    │
    │ id, firstName│
    │ NO academyId │
    └──────────────┘
```

## 🔗 Two Linking Patterns

### Pattern A: Direct Link (Most Entities)

```
Courses ────────┐
Teachers ───────┤
Classes ────────┼──→ academyId ──→ Academy
Academic Years ─┤
Settings ───────┘
```

**Characteristics:**
- Entity has `academyId` column
- Direct FK relationship to Academy
- Simple queries with WHERE clause
- Entity belongs to exactly one academy

**Example Entities:**
- Course
- Teacher  
- Class
- Academic Year
- Trimester
- Test

### Pattern B: Indirect Link (Students)

```
Student ──→ StudentInscription ──→ AcademicYear ──→ Academy
```

**Characteristics:**
- No `academyId` on Student table
- Linked through enrollment records
- Requires JOIN queries
- Student can have multiple enrollments across academies

**Why this pattern?**
- Students can transfer between academies
- Complete enrollment history maintained
- Student record reusable across institutions
- Enrollment = Academy membership proof

## 🎯 Query Examples

### Direct Link Query (Courses)
```sql
SELECT * FROM courses 
WHERE academy_id = 'tenant-uuid'
AND is_active = true;
```

```typescript
this.repository.find({
  where: { academyId: tenantId, isActive: true }
});
```

### Indirect Link Query (Students)
```sql
SELECT DISTINCT s.* 
FROM students s
INNER JOIN student_inscriptions si ON s.id = si.student_id
INNER JOIN academic_years ay ON si.academic_year_id = ay.id
WHERE ay.academy_id = 'tenant-uuid';
```

```typescript
this.repository
  .createQueryBuilder('student')
  .leftJoinAndSelect('student.inscriptions', 'inscription')
  .leftJoinAndSelect('inscription.academicYear', 'academicYear')
  .where('academicYear.academyId = :tenantId', { tenantId })
  .getMany();
```

## 📋 Complete Relationship Chain

```
Academy (Tenant)
  ├── Academic Years [Direct]
  │     ├── Student Inscriptions [Direct to Year]
  │     │     └── Students [Indirect to Academy via Inscriptions]
  │     ├── Trimesters [Direct]
  │     └── Class Years [Direct]
  │           ├── Classes [Direct]
  │           │     └── Course Classes [Direct]
  │           │           └── Courses [Direct to Academy]
  │           └── Tests [Direct]
  │
  ├── Courses [Direct]
  ├── Users [Direct]
  └── Settings [Direct]
```

## ✅ Multi-Tenant Checklist by Entity Type

### For Direct Link Entities:
- [x] Has `academyId` column
- [x] Has FK to Academy table
- [x] All queries filter by `academyId`
- [x] `academyId` set on create
- [x] Cannot change `academyId` after creation

### For Indirect Link Entities (Students):
- [x] NO `academyId` column
- [x] Linked through StudentInscription
- [x] Queries JOIN through relationships
- [x] Enrollment creates academy link
- [x] Can have multiple academy associations (historical)

## 🔐 Security Implications

### Direct Link
**Pros:**
- Simple, fast queries
- Obvious ownership
- Easy to audit

**Cons:**
- Cannot share entities between academies
- Harder to handle transfers

### Indirect Link
**Pros:**
- Flexible, reusable records
- Historical tracking
- Easy transfers

**Cons:**
- Complex queries
- Must carefully validate through joins
- More join overhead

## 💡 When to Use Each Pattern

### Use Direct Link When:
- Entity is academy-specific (courses, classes)
- Entity cannot be shared (settings, configurations)
- Entity has no reason to transfer
- Simple queries are priority

### Use Indirect Link When:
- Entity can exist across multiple tenants
- Need historical tracking
- Transfers are common
- Relationship defines membership

## 🎓 Student-Specific Flow

### Creating a Student
```typescript
// 1. Create student record (no academy link yet)
const student = await studentRepo.create({
  firstName: 'John',
  lastName: 'Doe',
  // NO academyId
});

// 2. Enroll in academy through inscription
const inscription = await inscriptionRepo.create({
  studentId: student.id,
  academicYearId: currentAcademicYear.id, // Links to academy
  status: 'CONFIRMED'
});

// Now student is linked to academy!
```

### Querying Students in Tenant
```typescript
// Only students with active inscriptions in this academy
const students = await studentRepo
  .createQueryBuilder('student')
  .leftJoinAndSelect('student.inscriptions', 'inscription')
  .leftJoinAndSelect('inscription.academicYear', 'academicYear')
  .where('academicYear.academyId = :academyId', { 
    academyId: tenantId 
  })
  .andWhere('inscription.status = :status', { 
    status: 'CONFIRMED' 
  })
  .getMany();
```

### Student Transfer Scenario
```typescript
// Student can have inscriptions in multiple academies
// Historical record maintained

Student "John Doe"
├── Inscription 1 → Academy A (2023-2024) [COMPLETED]
└── Inscription 2 → Academy B (2024-2025) [CONFIRMED]

// Academy A can see historical enrollment
// Academy B can see current enrollment
// Both academies isolated from each other
```

## 🚀 Performance Tips

### Direct Link (Fast)
```typescript
// Single table query with index
CREATE INDEX idx_courses_academy ON courses(academy_id);

// Query: ~1ms
```

### Indirect Link (Needs Optimization)
```typescript
// Multiple JOINs - needs indexes
CREATE INDEX idx_inscriptions_student ON student_inscriptions(student_id);
CREATE INDEX idx_inscriptions_year ON student_inscriptions(academic_year_id);
CREATE INDEX idx_academic_years_academy ON academic_years(academy_id);

// Query: ~5-10ms (still fast with indexes)
```

## 📚 Summary

- **Most entities**: Use Direct Link (academyId column)
- **Students only**: Use Indirect Link (through inscriptions)
- **Always filter** by academy in queries
- **Index properly** for performance
- **Test isolation** between tenants
- **Document pattern** used for each entity
