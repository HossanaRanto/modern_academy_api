import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable validation globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable CORS
  app.enableCors();

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Modern Academy API')
    .setDescription(`
      ## Multi-Tenant SaaS API for Educational Academy Management
      
      ### Academic Year Context
      Many endpoints require the \`x-academic-year-id\` header to specify which academic year the operation applies to.
      Click "Authorize" next to "AcademicYear" to set this header globally for all requests.
    `)
    .setVersion('1.0')
    .addTag('Authentication', 'User authentication endpoints (Public)')
    .addTag('Academies', 'Academy management endpoints (Authenticated)')
    .addTag('Students (Tenant-Specific)', '🔒 Student management - Requires academy membership')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token from sign-in response',
        in: 'header',
      },
      'JWT-auth',
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-academic-year-id',
        in: 'header',
        description: 'Academic Year ID (UUID) - Required for academic year-specific operations',
      },
      'AcademicYear',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // This keeps the token in the UI after page refresh
    },
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation available at: http://localhost:${port}/api/docs`);
}
bootstrap();
