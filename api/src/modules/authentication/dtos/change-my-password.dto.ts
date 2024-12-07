import { IsNotEmpty, IsString, MinLength, minLength } from 'class-validator';

export class ChangeMyPasswordDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  new_password: string;
}
