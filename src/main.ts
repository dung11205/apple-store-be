import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { ValidationError } from 'class-validator';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Cho phép CORS cho FE (Vite port 5173)
  app.enableCors({
    origin: 'http://localhost:5173',
    methods: 'GET,POST,PUT,DELETE',
    credentials: true,
  });

  //  Global ValidationPipe với exceptionFactory tùy chỉnh
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
      exceptionFactory: (errors: ValidationError[]) => {
        console.error('Validation errors:', JSON.stringify(errors, null, 2));

        //  Hàm đệ quy gom tất cả message kể cả nested children
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

        //  Gộp tất cả message lại
        const errorMessages = extractMessages(errors).join('; ');

        //  Trả về lỗi chi tiết
        return new BadRequestException(
          `Dữ liệu không hợp lệ: ${errorMessages}`,
        );
      },
    }),
  );

  //  Chạy server
  await app.listen(process.env.PORT ?? 3000);
  console.log(`App chạy tại http://localhost:${process.env.PORT ?? 3000}`);
}

//  Bắt lỗi khởi động
bootstrap().catch((err) => {
  console.error('Bootstrap failed:', err);
  process.exit(1);
});
