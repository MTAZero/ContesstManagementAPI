import { IsOptional, IsString, IsDate, IsInt, IsMongoId } from 'class-validator';

export class UpdateContestDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  start_time?: Date; // Thời gian bắt đầu mới

  @IsOptional()
  @IsInt()
  duration?: number; // Thời lượng mới (phút)

  @IsOptional()
  @IsMongoId()
  user_created?: string; // Người tạo (nếu cần cập nhật)
}