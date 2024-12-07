import { IsOptional, IsString } from 'class-validator';

export class UpdateInfoDto {
  @IsString()
  @IsOptional()
  full_name: string;
}
