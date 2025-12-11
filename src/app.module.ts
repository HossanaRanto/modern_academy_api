import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { AcademyModule } from './modules/academy/academy.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: (process.env.DB_TYPE as 'postgres' | 'mysql') || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'modern_academy',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
      synchronize: false, // Always false in production - use migrations instead
      autoLoadEntities: true,
      logging: process.env.NODE_ENV === 'development',
    }),
    AuthModule,
    AcademyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
