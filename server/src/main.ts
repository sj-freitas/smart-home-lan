import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import * as cors from 'cors';
import { ExpressAdapter } from '@nestjs/platform-express';
import { MEL_CLOUD_AUTHENTICATION_COOKIES } from './integrations/mel-cloud-home/module';

async function bootstrap() {
  const server = express();
  server.use(cors());

  // Use the ExpressAdapter wrapper — do not pass `server` directly to NestFactory.create
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  app.setGlobalPrefix('api');

  console.log(`Prefetching the MelCloudHome Authentication Cookies on bootstrap...`)
  await app.get(MEL_CLOUD_AUTHENTICATION_COOKIES);
  console.log(`Prefetched MelCloudHome Authentication Cookies`);

  await app.listen(3001, '0.0.0.0');
  console.log('Server listening on http://0.0.0.0:3001');
}
bootstrap();
