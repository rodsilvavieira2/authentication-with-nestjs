import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { setSwagger } from './helpers/set-swagger';
import { setHbsView } from './helpers';

const port = process.env.PORT ?? 3000;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  setSwagger(app);
  setHbsView(app);

  app.enableCors();

  await app.listen(port);
}
bootstrap();
