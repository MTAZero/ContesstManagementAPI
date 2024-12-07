import { InjectModel } from '@nestjs/mongoose';
import { BaseDBService } from './base';
import { Injectable } from '@nestjs/common';
import { Question } from '../schemas/questions.schema';

@Injectable()
export class QuestionsRepository extends BaseDBService<Question> {
  constructor(
    @InjectModel(Question.name) private readonly entityModel
  ) {
    super(entityModel);
  }
}