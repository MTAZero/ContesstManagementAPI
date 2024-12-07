import { Module } from '@nestjs/common';
import { QuestionsController } from './questions.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [QuestionsController],
})
export class QuestionsModule {}
