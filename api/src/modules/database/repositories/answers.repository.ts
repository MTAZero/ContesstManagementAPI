import { InjectModel } from '@nestjs/mongoose';
import { BaseDBService } from './base';
import {
  Injectable,
} from '@nestjs/common';
import { Answer } from '../schemas/answers.schema';

@Injectable()
export class AnswerRepository extends BaseDBService<Answer> {
  constructor(
    @InjectModel(Answer.name) private readonly entityModel
  ) {
    super(entityModel);
  }
}
