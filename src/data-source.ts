import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

// Load environment variables
config();

// Determine database type based on port (5432 = PostgreSQL, 3306 = MySQL)
const dbPort = parseInt(process.env.DB_PORT || '3306');
const dbType = dbPort === 5432 ? 'postgres' : 'mysql';

const dataSourceConfig: DataSourceOptions = {
  type: dbType as 'postgres' | 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: dbPort,
  username: process.env.DB_USERNAME || (dbType === 'postgres' ? 'postgres' : 'root'),
  password: process.env.DB_PASSWORD || (dbType === 'postgres' ? 'postgres' : ''),
  database: process.env.DB_DATABASE || 'modern_academy',
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/database/migrations/*.js'],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
};

export const AppDataSource = new DataSource(dataSourceConfig);
