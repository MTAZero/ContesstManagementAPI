import { IsOptional, IsString } from 'class-validator';

export class UpdateCategoryQuestionDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
