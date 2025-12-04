# TypeORM Migrations Guide

## Setup

The project uses TypeORM migrations for database schema management. The DataSource configuration is in `src/data-source.ts`.

## Available Commands

### Generate Migration
Generate a migration file based on changes in your entities:
```bash
npm run build
npm run migration:generate -- src/database/migrations/MigrationName
```

### Create Empty Migration
Create an empty migration file to write custom SQL:
```bash
npm run migration:create -- src/database/migrations/MigrationName
```

### Run Migrations
Apply all pending migrations to the database:
```bash
npm run build
npm run migration:run
```

### Revert Migration
Revert the last executed migration:
```bash
npm run build
npm run migration:revert
```

### Show Migrations
Show all migrations and their status:
```bash
npm run build
npm run migration:show
```

### Schema Sync
Synchronize database schema with entities (⚠️ Use with caution, only in development):
```bash
npm run build
npm run schema:sync
```

### Schema Drop
Drop all database tables (⚠️ Destructive operation):
```bash
npm run build
npm run schema:drop
```

## Best Practices

1. **Always build before running migrations**: Run `npm run build` to compile TypeScript to JavaScript
2. **Never use synchronize in production**: Set `synchronize: false` in production environments
3. **Use migrations for schema changes**: Generate migrations for all schema changes
4. **Test migrations**: Test both `up` and `down` methods of your migrations
5. **Version control**: Commit migration files to version control
6. **Sequential naming**: Migrations are executed in chronological order based on timestamp

## Workflow Example

1. Create or modify an entity file
2. Build the project: `npm run build`
3. Generate migration: `npm run migration:generate -- src/database/migrations/AddUserTable`
4. Review the generated migration file
5. Run migration: `npm run migration:run`
6. If needed, revert: `npm run migration:revert`

## Database Configuration

Update your `.env` file with your database credentials:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=modern_academy
NODE_ENV=development
```
