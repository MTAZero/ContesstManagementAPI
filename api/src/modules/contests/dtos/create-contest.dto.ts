import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, IsDate, IsInt, IsMongoId } from 'class-validator';

export class CreateContestDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  start_time: Date; // Thời gian bắt đầu

  @IsNotEmpty()
  @IsInt()
  duration: number; // Thời lượng cuộc thi (phút)
}