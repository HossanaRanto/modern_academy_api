import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

// Load environment variables
config();

// Get database type from environment variable
const dbType = (process.env.DB_TYPE as 'postgres' | 'mysql') || 'postgres';
const dbPort = parseInt(process.env.DB_PORT || '5432');

const dataSourceConfig: DataSourceOptions = {
  type: dbType,
  url: process.env.DB_URL || undefined,
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
