import { Injectable } from '@nestjs/common';
import { databaseConfig } from './configs/configuration.config';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!' + databaseConfig().uri;
  }
}
