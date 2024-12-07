import { InjectModel } from '@nestjs/mongoose';
import { BaseDBService } from './base';
import { Injectable } from '@nestjs/common';
import { UserContest } from '../schemas/user_contest.schema';

@Injectable()
export class UserContestRepository extends BaseDBService<UserContest> {
  constructor(
    @InjectModel(UserContest.name) private readonly entityModel
  ) {
    super(entityModel);
  }
}