import { InjectModel } from '@nestjs/mongoose';
import { User } from '../schemas/users.schema';
import { BaseDBService } from './base';
import {
  HttpException,
  Injectable,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {
  BCRYPT_SALT,
  MAX_ITEM_QUERYS,
  ResponseCode,
  ResponseMessage,
} from 'src/const';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserRepository extends BaseDBService<User> {
  constructor(
    @InjectModel(User.name) private readonly entityModel,
    private readonly jwtService: JwtService,
  ) {
    super(entityModel);
  }

  async insertItem(entity: any): Promise<any> {
    const cnt = await this.countByFilter({ username: entity.username });
    if (cnt > 0)
      throw new HttpException(
        ResponseMessage.ALREADY_EXIST,
        ResponseCode.BAD_REQUEST,
      );

    entity.password = await bcrypt.hash(entity.password, BCRYPT_SALT);
    return super.insertItem(entity);
  }

  async validateUser(
    username: string,
    password: string,
  ): Promise<{
    isValidate: boolean;
    user: User | null;
  }> {
    try {
      const dataRequest = await this.entityModel
        .find({ username })
        .limit(1)
        .lean()
        .exec();
      const user = dataRequest[0];

      if (!user)
        return {
          isValidate: false,
          user: null,
        };

      if (await bcrypt.compare(password, user.password))
        return {
          isValidate: true,
          user,
        };
    } catch (ex) {}

    return {
      isValidate: false,
      user: null,
    };
  }

  async signTokenByUser(user: User) {
    const payload = {
      username: user.username,
      sub: user._id,
    };

    return {
      user: user,
      access_token: this.jwtService.sign(payload),
    };
  }

  async changePassword(
    id: string,
    old_password = '',
    new_password = '',
  ): Promise<boolean> {
    const dataRequest = await this.entityModel
      .find({ _id: id })
      .limit(1)
      .lean()
      .exec();
    const user = dataRequest[0];
    if (!user) throw new HttpException('Not Found', ResponseCode.ERROR);

    const res = await bcrypt.compare(old_password, user.password);
    if (!res) throw new HttpException('Password incorrect', ResponseCode.ERROR);

    try {
      user.password = await bcrypt.hash(new_password, 10);

      await this.updateItem(id, user);
      return true;
    } catch (ex) {
      console.log('User ChangePassword Error : ', ex.message);
      return false;
    }
  }

  async getItemByUsername(username: string) {
    const requestData = await this.getItems({
      filter: {
        username: username,
      },
      skip: 0,
      limit: MAX_ITEM_QUERYS,
    });

    const user = requestData.items.length !== 0 ? requestData.items[0] : null;
    return user;
  }
}
