import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { AcademyModule } from './modules/academy/academy.module';
import { StudentsModule } from './modules/students/students.module';
import { ClassesModule } from './modules/classes/classes.module';
import { CoursesModule } from './modules/courses/courses.module';
import { TenantInterceptor } from './shared/interceptors/tenant.interceptor';
import { AcademicYearGuard } from './shared/guards/academic-year.guard';
import { CacheConfigService } from './config/cache.config';
import { AcademicYear } from './entities/academic-year.entity';

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
    TypeOrmModule.forFeature([AcademicYear]),
    CacheModule.registerAsync({
      isGlobal: true,
      useClass: CacheConfigService,
    }),
    AuthModule,
    AcademyModule,
    StudentsModule,
    ClassesModule,
    CoursesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TenantInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: AcademicYearGuard,
    },
  ],
})
export class AppModule {}
