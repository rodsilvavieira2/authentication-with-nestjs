import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setSwagger(app: NestExpressApplication) {
  const config = new DocumentBuilder()
    .setTitle('JWT Authentication API')
    .setDescription('Aplicação de exemplo de autenticação JWT com nest.js')
    .setContact(
      'Rodrigo Silva',
      'https://tubular-toffee-d6a32e.netlify.app/',
      'rodsilvavieira@gmail.com',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .setBasePath('/')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/', app, document);
}
