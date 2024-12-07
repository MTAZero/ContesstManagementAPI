import {
  IsBoolean,
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { UserRolesEnum } from 'src/enums';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  fullname: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  @IsIn([UserRolesEnum.Admin, UserRolesEnum.User])
  role: UserRolesEnum;
}
