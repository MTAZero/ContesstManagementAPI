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
import { UserRepository } from '../database/repositories/users.repository';
import { PaginationType } from 'src/middleware';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { CurrentUser } from 'src/decorator/current-user.decorator';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { AdminGuard } from '../authentication/guards/admin-auth.guard';

@Controller('users')
export class UsersController {
  @Inject(UserRepository)
  userRepository: UserRepository;

  @Get('/')
  @UseGuards(JwtAuthGuard)
  async getListUsers(
    @Res() res,
    @Req() req,
    @Query() query,
    @CurrentUser() user,
  ) {
    const pagination: PaginationType = req.pagination;
    const sort = req.sort;
    const filter = {};
    const keyword = query.keyword ? query.keyword : '';

    const data = await this.userRepository.getItems({
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
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(AdminGuard)
  async insertUser(
    @Body(new ValidationPipe()) entity: CreateUserDto,
    @Res() res,
  ) {
    const ans = await this.userRepository.insertItem(entity);
    return ApiResponse(
      res,
      true,
      ResponseCode.SUCCESS,
      ResponseMessage.SUCCESS,
      ans,
    );
  }

  @Put('/:id')
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(JwtAuthGuard)
  async updateUser(
    @Body(new ValidationPipe()) entity: UpdateUserDto,
    @Res() res,
    @Param() params,
  ) {
    const id = params.id;
    const ans = await this.userRepository.updateItem(id, entity);
    return ApiResponse(
      res,
      true,
      ResponseCode.SUCCESS,
      ResponseMessage.SUCCESS,
      ans,
    );
  }

  @Delete('/:id')
  @UseGuards(JwtAuthGuard)
  async removeUser(@Res() res, @Param() params) {
    const id = params.id;
    const ans = await this.userRepository.removeItem(id);
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
  async getDetailUser(@Res() res, @Param() params) {
    const id = params.id;
    const ans = await this.userRepository.getItemById(id);
    return ApiResponse(
      res,
      true,
      ResponseCode.SUCCESS,
      ResponseMessage.SUCCESS,
      ans,
    );
  }
}
