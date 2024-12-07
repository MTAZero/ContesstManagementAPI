import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { UserDBService } from 'src/modules/database/services/userDBService';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  @Inject(UserDBService)
  userDBService: UserDBService;

  async validate(username: string, password: string): Promise<any> {
    const result = await this.userDBService.validateUser(username, password);

    if (!result.isValidate) throw new UnauthorizedException();

    return result.user;
  }
}
