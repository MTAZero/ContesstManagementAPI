import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryQuestionDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;
}
