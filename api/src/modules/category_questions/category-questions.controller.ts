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
import { CategoryQuestionsRepository } from '../database/repositories/category_questions.repository';
import { PaginationType } from 'src/middleware';
import { CreateCategoryQuestionDto } from './dtos/create-category-question.dto';
import { UpdateCategoryQuestionDto } from './dtos/update-category-question.dto';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { AdminGuard } from '../authentication/guards/admin-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('category-questions')
export class CategoryQuestionsController {
  @Inject(CategoryQuestionsRepository)
  categoryQuestionsRepository: CategoryQuestionsRepository;

  @Get('/')
  @UseGuards(JwtAuthGuard)
  async getListCategoryQuestions(
    @Res() res,
    @Req() req,
    @Query() query,
  ) {
    const pagination: PaginationType = req.pagination;
    const sort = req.sort;
    const filter = {};
    const keyword = query.keyword ? query.keyword : '';

    const data = await this.categoryQuestionsRepository.getItems({
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
  async insertCategoryQuestion(
    @Body(new ValidationPipe()) entity: CreateCategoryQuestionDto,
    @Res() res,
  ) {
    const ans = await this.categoryQuestionsRepository.insertItem(entity);
    return ApiResponse(
      res,
      true,
      ResponseCode.SUCCESS,
      ResponseMessage.SUCCESS,
      ans,
    );
  }

  @Put('/:id')
  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor('file'))
  async updateCategoryQuestion(
    @Body(new ValidationPipe()) entity: UpdateCategoryQuestionDto,
    @Res() res,
    @Param() params,
  ) {
    const id = params.id;
    const ans = await this.categoryQuestionsRepository.updateItem(id, entity);
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
  async removeCategoryQuestion(@Res() res, @Param() params) {
    const id = params.id;
    const ans = await this.categoryQuestionsRepository.removeItem(id);
    return ApiResponse(
      res,
      true,
      ResponseCode.SUCCESS,
      ResponseMessage.SUCCESS,
      ans,
    );
  }

  @Get('/:id')
  @UseGuards(JwtAuthGuard)
  async getDetailCategoryQuestion(@Res() res, @Param() params) {
    const id = params.id;
    const ans = await this.categoryQuestionsRepository.getItemById(id);
    return ApiResponse(
      res,
      true,
      ResponseCode.SUCCESS,
      ResponseMessage.SUCCESS,
      ans,
    );
  }
}
