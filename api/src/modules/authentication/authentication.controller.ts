import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Put,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { UserDBService } from '../database/repositories/users.repository';
import { UpdateInfoDto } from './dtos/update-info.dto';
import { ChangeMyPasswordDto } from './dtos/change-my-password.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResponseCode, ResponseMessage } from 'src/const';
import { ApiResponse } from 'src/utils';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CurrentUser } from 'src/decorator/current-user.decorator';
import { User } from '../database/schemas/users.schema';

@Controller('authentication')
export class AuthenticationController {
  @Inject(UserDBService)
  userDBService: UserDBService;

  @UseGuards(LocalAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Post('login')
  async login(@Res() res, @Req() req) {
    const ans = await this.userDBService.signTokenByUser(req.user);

    return ApiResponse(
      res,
      true,
      ResponseCode.SUCCESS,
      ResponseMessage.SUCCESS,
      ans,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('/my-info')
  async handleGetMyInfo(@Req() req, @Res() res, @CurrentUser() user) {
    const ans = (await this.userDBService.getFirstItem({ _id: user._id }))
    
    return ApiResponse(
      res,
      true,
      ResponseCode.SUCCESS,
      ResponseMessage.SUCCESS,
      ans,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('/check-token')
  async handleCheckToken(@Req() req, @Res() res, @CurrentUser() user) {
    const ans = await this.userDBService.getFirstItem({ _id: user._id });

    return ApiResponse(
      res,
      true,
      ResponseCode.SUCCESS,
      ResponseMessage.SUCCESS,
      ans,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put('/update-info')
  @UseInterceptors(FileInterceptor('file'))
  async handleUpdateInfo(
    @Req() req,
    @Res() res,
    @Body(new ValidationPipe()) entity: UpdateInfoDto,
    @UploadedFile() file,
  ) {
    const id = req.userId;
    const update = { full_name: entity.full_name };

    const ans = await this.userDBService.updateItem(id, update);

    return ApiResponse(
      res,
      true,
      ResponseCode.SUCCESS,
      ResponseMessage.SUCCESS,
      ans,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put('/change-my-password')
  @UseInterceptors(FileInterceptor('file'))
  async handleChangeMyPassword(
    @Req() req,
    @Res() res,
    @Body(new ValidationPipe()) entity: ChangeMyPasswordDto,
    @CurrentUser() user: User,
  ) {
    const result = await this.userDBService.changePassword(
      user._id.toString(),
      entity.password,
      entity.new_password,
    );

    return ApiResponse(
      res,
      true,
      ResponseCode.SUCCESS,
      ResponseMessage.SUCCESS,
      result,
    );
  }

}
