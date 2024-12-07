import { InjectModel } from '@nestjs/mongoose';
import { BaseDBService } from './base';
import { Injectable } from '@nestjs/common';
import { CategoryQuestion } from '../schemas/category_questions.schema';

@Injectable()
export class CategoryQuestionsRepository extends BaseDBService<CategoryQuestion> {
  constructor(
    @InjectModel(CategoryQuestion.name) private readonly entityModel
  ) {
    super(entityModel);
  }
}