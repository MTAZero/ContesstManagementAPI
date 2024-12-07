import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appConfig } from './configs/configuration.config';
import { readFileSync } from 'fs'

async function bootstrap() {
  // const httpsOptions = {
  //   key: readFileSync('src/configs/secrets/cds.t1.bqp.key'),
  //   cert: readFileSync('src/configs/secrets/cds.t1.bqp.crt'),
  // }
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    allowedHeaders: '*',
    origin: '*',
    credentials: true,
  });

  await app.listen(appConfig().port);
}
bootstrap();
