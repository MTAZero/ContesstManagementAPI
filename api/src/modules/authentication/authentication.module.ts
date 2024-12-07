import { Module } from '@nestjs/common';
import { AuthenticationController } from './authentication.controller';
import { PassportModule } from '@nestjs/passport';
import { DatabaseModule } from '../database/database.module';
import { JwtStrategy, LocalStrategy } from './strategies';

@Module({
  imports: [DatabaseModule, PassportModule],
  controllers: [AuthenticationController],
  providers: [LocalStrategy, JwtStrategy],
})
export class AuthenticationModule {}
