import { Module } from '@nestjs/common';
import { CategoryQuestionsController } from './category-questions.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [CategoryQuestionsController],
})
export class CategoryQuestionsModule {}
