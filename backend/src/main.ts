import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
  );
  const origins = process.env.CORS_ORIGIN?.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);
  app.enableCors({ origin: origins?.length ? origins : true });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();