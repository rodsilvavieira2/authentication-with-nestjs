import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

export function setHbsView(app: NestExpressApplication) {
  app.setViewEngine('hbs');
  app.setBaseViewsDir(join(__dirname, '..', '..', '..', 'views'));
  app.useStaticAssets(join(__dirname, '..', '..', '..', 'public'));
}
