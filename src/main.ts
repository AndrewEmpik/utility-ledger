import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as os from 'os';

async function bootstrap() {
  const PORT = 3020;
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setBaseViewsDir(join(__dirname, '../../views'));
  app.setViewEngine('pug');

  await app.listen(PORT);

  const networkInterfaces = os.networkInterfaces();
  const localIp = networkInterfaces['wlo1'][0].address;

  console.log(`App is running on local address: http://${localIp}:${PORT}`);
}
bootstrap();
