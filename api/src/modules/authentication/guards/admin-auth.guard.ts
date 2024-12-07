import { ForbiddenException, Inject, UnauthorizedException } from '@nestjs/common';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { UserRepository } from 'src/modules/database/repositories/users.repository';
@Injectable()
export class AdminGuard extends AuthGuard('jwt') {
  @Inject(UserRepository)
  userRepository: UserRepository;

  constructor(private readonly _reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const passportActive = await super.canActivate(context);

    if (!passportActive) {
      throw new UnauthorizedException();
    }

    const request = context.switchToHttp().getRequest();
    const user = await this.userRepository.getItemById(request.user.userId);
    if (!user) return false;
    
    // Kiểm tra role của user
    if (user.role !== 'admin') {
      throw new ForbiddenException('Access denied: Admins only');
    }
  

    request.userId = user._id;
    request.user = user;

    return true;
  }
}
