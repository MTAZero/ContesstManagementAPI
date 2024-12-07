import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { UserRepository } from 'src/modules/database/repositories/users.repository';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  @Inject(UserRepository)
  userRepository: UserRepository;

  async validate(username: string, password: string): Promise<any> {
    const result = await this.userRepository.validateUser(username, password);

    if (!result.isValidate) throw new UnauthorizedException();

    return result.user;
  }
}
