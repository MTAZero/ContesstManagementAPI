import { Type } from "class-transformer";
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDate,
  IsInt,
  ValidateIf,
  Validate,
} from "class-validator";

class IsEndTimeGreaterThanStartTime {
  validate(value: Date, args: any) {
    const startTime: Date = args.object.start_time;
    return value > startTime;
  }

  defaultMessage() {
    return "end_time phải lớn hơn start_time";
  }
}

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
  @IsDate()
  @Type(() => Date)
  @Validate(IsEndTimeGreaterThanStartTime) // Validate end_time > start_time
  end_time: Date; // Thời gian kết thúc

  @IsOptional()
  @ValidateIf((obj) => obj.duration !== undefined)
  @IsInt()
  duration?: number; // Thời lượng cuộc thi (phút)
}
