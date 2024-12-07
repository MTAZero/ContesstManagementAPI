import { InjectModel } from '@nestjs/mongoose';
import { BaseDBService } from './base';
import { Injectable } from '@nestjs/common';
import { Contest } from '../schemas/contests.schema';

@Injectable()
export class ContestsRepository extends BaseDBService<Contest> {
  constructor(
    @InjectModel(Contest.name) private readonly entityModel
  ) {
    super(entityModel);
  }
}