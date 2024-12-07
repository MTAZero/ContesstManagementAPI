import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { ResponseCode, ResponseMessage } from 'src/const';
import { ApiResponse } from 'src/utils';

import { PaginationType } from 'src/middleware';
import { CreateQuestionDto } from './dtos/create-question.dto';
import { UpdateQuestionDto } from './dtos/update-question.dto';
import { AdminGuard } from '../authentication/guards/admin-auth.guard';
import { QuestionsRepository } from '../database/repositories/questions.respository';
import { FileInterceptor } from '@nestjs/platform-express';
import { AnswerRepository } from '../database/repositories/answers.repository';

@Controller('questions')
export class QuestionsController {
  @Inject(QuestionsRepository)
  questionsRepository: QuestionsRepository;

  @Inject(AnswerRepository)
  answersRepository: AnswerRepository;

  @Get('/')
  @UseGuards(AdminGuard)
  async getListQuestions(
    @Res() res,
    @Req() req,
    @Query() query,
  ) {
    const pagination: PaginationType = req.pagination;
    const sort = req.sort;
    const filter = {};
    const keyword = query.keyword ? query.keyword : '';

    const data = await this.questionsRepository.getItems({
      filter,
      sort,
      skip: pagination.skip,
      limit: pagination.limit,
      textSearch: keyword,
    });

    return ApiResponse(
      res,
      true,
      ResponseCode.SUCCESS,
      ResponseMessage.SUCCESS,
      data,
    );
  }

  @Post('')
@UseGuards(AdminGuard)
@UseInterceptors(FileInterceptor('file'))
async insertQuestion(
  @Body(new ValidationPipe()) entity: CreateQuestionDto,
  @Res() res,
) {
  // Tách thông tin câu trả lời (answers) từ entity
  const { answers, ...questionData } = entity;

  // Tạo câu hỏi mới
  const createdQuestion = await this.questionsRepository.insertItem(questionData);

  // Lưu từng câu trả lời vào bảng `answers`
  if (answers && answers.length > 0) {
    const answerPromises = answers.map((answer) =>
      this.answersRepository.insertItem({
        ...answer,
        question: createdQuestion._id, // Liên kết câu trả lời với câu hỏi
      }),
    );
    await Promise.all(answerPromises);
  }

  // Trả về kết quả
  return ApiResponse(
    res,
    true,
    ResponseCode.SUCCESS,
    ResponseMessage.SUCCESS,
    createdQuestion,
  );
}

  @Put('/:id')
  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor('file'))
  async updateQuestion(
    @Body(new ValidationPipe()) entity: UpdateQuestionDto,
    @Res() res,
    @Param() params,
  ) {
    const id = params.id;
    const ans = await this.questionsRepository.updateItem(id, entity);
    return ApiResponse(
      res,
      true,
      ResponseCode.SUCCESS,
      ResponseMessage.SUCCESS,
      ans,
    );
  }

  @Delete('/:id')
  @UseGuards(AdminGuard)
  async removeQuestion(@Res() res, @Param() params) {
    const id = params.id;
    const ans = await this.questionsRepository.removeItem(id);
    return ApiResponse(
      res,
      true,
      ResponseCode.SUCCESS,
      ResponseMessage.SUCCESS,
      ans,
    );
  }

  @Get('/:id')
  @UseGuards(AdminGuard)
  async getDetailQuestion(@Res() res, @Param() params) {
    const id = params.id;
    const ans = await this.questionsRepository.getItemById(id);
    return ApiResponse(
      res,
      true,
      ResponseCode.SUCCESS,
      ResponseMessage.SUCCESS,
      ans,
    );
  }
}
