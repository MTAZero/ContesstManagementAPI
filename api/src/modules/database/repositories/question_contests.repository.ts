import { InjectModel } from '@nestjs/mongoose';
import { BaseDBService } from './base';
import { Injectable } from '@nestjs/common';
import { QuestionContest } from '../schemas/question_contest.schema';

@Injectable()
export class QuestionContestsRepository extends BaseDBService<QuestionContest> {
  constructor(
    @InjectModel(QuestionContest.name) private readonly entityModel
  ) {
    super(entityModel);
  }
}