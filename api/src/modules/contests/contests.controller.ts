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
} from "@nestjs/common";
import { ResponseCode, ResponseMessage } from "src/const";
import { ApiResponse } from "src/utils";
import { PaginationType } from "src/middleware";
import { CreateContestDto } from "./dtos/create-contest.dto";
import { UpdateContestDto } from "./dtos/update-contest.dto";
import { AdminGuard } from "../authentication/guards/admin-auth.guard";
import { ContestsRepository } from "../database/repositories/contests.repository";
import { FileInterceptor } from "@nestjs/platform-express";
import { CurrentUser } from "src/decorator/current-user.decorator";

@Controller("contests")
export class ContestsController {
  @Inject(ContestsRepository)
  contestsRepository: ContestsRepository;

  @Get("/")
  @UseGuards(AdminGuard)
  async getListContests(
    @Res() res,
    @Req() req,
    @Query("keyword") keyword: string, // Lấy tham số keyword để tìm kiếm
    @Query() query
  ) {
    const pagination: PaginationType = req.pagination;
    const sort = req.sort;

    const filter: any = {};
    if (keyword) {
      filter.name = { $regex: keyword, $options: "i" }; // Tìm kiếm theo tên (không phân biệt hoa thường)
    }

    const data = await this.contestsRepository.getItems({
      filter,
      sort,
      skip: pagination.skip,
      limit: pagination.limit,
      textSearch: query.keyword || "",
    });

    return ApiResponse(
      res,
      true,
      ResponseCode.SUCCESS,
      ResponseMessage.SUCCESS,
      data
    );
  }

  @Post("")
  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor("file"))
  async insertContest(
    @Body(new ValidationPipe()) entity: CreateContestDto,
    @CurrentUser() user: any, // Lấy thông tin người dùng hiện tại
    @Res() res
  ) {
    // Bổ sung thông tin người tạo (user_created)
    const contestData = {
      ...entity,
      user_created: user._id, // ID của người dùng đang đăng nhập
    };

    // Tạo cuộc thi
    const createdContest =
      await this.contestsRepository.insertItem(contestData);

    return ApiResponse(
      res,
      true,
      ResponseCode.SUCCESS,
      ResponseMessage.SUCCESS,
      createdContest
    );
  }

  @Put("/:id")
  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor("file"))
  async updateContest(
    @Body(new ValidationPipe()) entity: UpdateContestDto,
    @Res() res,
    @Param() params
  ) {
    const id = params.id;
    const updatedContest = await this.contestsRepository.updateItem(id, entity);

    return ApiResponse(
      res,
      true,
      ResponseCode.SUCCESS,
      ResponseMessage.SUCCESS,
      updatedContest
    );
  }

  @Delete("/:id")
  @UseGuards(AdminGuard)
  async removeContest(@Res() res, @Param() params) {
    const id = params.id;
    const result = await this.contestsRepository.removeItem(id);

    return ApiResponse(
      res,
      true,
      ResponseCode.SUCCESS,
      ResponseMessage.SUCCESS,
      result
    );
  }

  @Get("/:id")
  @UseGuards(AdminGuard)
  async getDetailContest(@Res() res, @Param() params) {
    const id = params.id;
    const contestDetail = await this.contestsRepository.getItemById(id);

    return ApiResponse(
      res,
      true,
      ResponseCode.SUCCESS,
      ResponseMessage.SUCCESS,
      contestDetail
    );
  }
}
