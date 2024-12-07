import { InjectModel } from '@nestjs/mongoose';
import { BaseDBService } from './base';
import { Injectable } from '@nestjs/common';
import { UserChoice } from '../schemas/user_choices.schema';

@Injectable()
export class UserChoicesRepository extends BaseDBService<UserChoice> {
  constructor(
    @InjectModel(UserChoice.name) private readonly entityModel
  ) {
    super(entityModel);
  }
}