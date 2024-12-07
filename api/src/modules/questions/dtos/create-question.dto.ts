import {
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  IsBoolean,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { IsCorrectEnum } from 'src/enums';

class AnswerDto {
  @IsNotEmpty()
  @IsString()
  content: string; // Nội dung của câu trả lời

  @IsNotEmpty()
  @IsBoolean()
  is_correct: boolean; // Đánh dấu liệu đây có phải là câu trả lời đúng
}

export class CreateQuestionDto {
  @IsNotEmpty()
  @IsString()
  content: string; // Nội dung của câu hỏi

  @IsOptional()
  @IsString()
  description: string; // Mô tả (nếu có)

  @IsNotEmpty()
  @IsMongoId()
  category: string; // ObjectId ánh xạ đến bảng category_questions

  @IsArray()
  @ArrayMinSize(1) // Yêu cầu ít nhất một câu trả lời
  @ArrayMaxSize(4) // Giới hạn tối đa 4 câu trả lời
  @ValidateNested({ each: true }) // Áp dụng validate cho từng phần tử trong mảng
  @Type(() => AnswerDto) // Chuyển đổi sang kiểu AnswerDto
  answers: AnswerDto[]; // Mảng các câu trả lời
}