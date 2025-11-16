import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express'; // ✅ thêm import

async function bootstrap() {
  // ✅ ép kiểu app về NestExpressApplication
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // CORS
  app.enableCors({
    origin: 'http://localhost:5173',
    methods: 'GET,POST,PUT,DELETE,PATCH',
    credentials: true,
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
      exceptionFactory: (errors: ValidationError[]) => {
        console.error('Validation errors:', JSON.stringify(errors, null, 2));

        const extractMessages = (
          validationErrors: ValidationError[],
        ): string[] => {
          return validationErrors.flatMap((error) => {
            const messages = Object.values(error.constraints ?? {});
            if (error.children && error.children.length > 0) {
              return [...messages, ...extractMessages(error.children)];
            }
            return messages;
          });
        };

        const errorMessages = extractMessages(errors).join('; ');

        return new BadRequestException(
          `Dữ liệu không hợp lệ: ${errorMessages}`,
        );
      },
    }),
  );

  // ✅ Expose thư mục uploads
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log(`✅ App chạy tại http://localhost:${process.env.PORT ?? 3000}`);
}

bootstrap().catch((err) => {
  console.error('Bootstrap failed:', err);
  process.exit(1);
});
