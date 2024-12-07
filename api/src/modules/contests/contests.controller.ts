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
import { QuestionContestsRepository } from "../database/repositories/question_contests.repository";
import { QuestionsRepository } from "../database/repositories/questions.respository";

@Controller("contests")
export class ContestsController {
  @Inject(ContestsRepository)
  contestsRepository: ContestsRepository;

  @Inject(QuestionContestsRepository)
  questionContestsRepository: QuestionContestsRepository;

  @Inject(QuestionsRepository)
  questionsRepository: QuestionsRepository;

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

  // Thêm một số câu hỏi vào contest
  @Post("/:contestId/questions")
  @UseGuards(AdminGuard)
  async addQuestionsToContest(
    @Param("contestId") contestId: string,
    @Body("questionIds") questionIds: string[],
    @Res() res
  ) {
    try {
      const contest = await this.contestsRepository.getItemById(contestId);
      if (!contest) {
        return ApiResponse(
          res,
          false,
          ResponseCode.ERROR,
          `Contest ${contestId} not found`,
          null
        );
      }

      const now = new Date();
      const allowedTime = new Date(contest.start_time);
      allowedTime.setMinutes(allowedTime.getMinutes() - 15);

      if (now > allowedTime) {
        return ApiResponse(
          res,
          false,
          ResponseCode.FORBIDDEN,
          "Cannot add questions within 15 minutes of contest start time",
          null
        );
      }

      const results = await Promise.all(
        questionIds.map(async (questionId) => {
          return this.questionContestsRepository.insertItem({
            contest: contestId,
            question: questionId,
          });
        })
      );

      return ApiResponse(
        res,
        true,
        ResponseCode.SUCCESS,
        `${results.length} questions added to contest successfully`,
        results
      );
    } catch (error) {
      console.error("Error adding questions to contest:", error.message);
      return ApiResponse(
        res,
        false,
        ResponseCode.ERROR,
        "Failed to add questions to contest",
        null
      );
    }
  }

  // Thêm tất cả câu hỏi từ một category vào contest
  @Post("/:contestId/category/:categoryId")
  @UseGuards(AdminGuard)
  async addCategoryQuestionsToContest(
    @Param("contestId") contestId: string,
    @Param("categoryId") categoryId: string,
    @Res() res
  ) {
    try {
      const contest = await this.contestsRepository.getItemById(contestId);
      if (!contest) {
        return ApiResponse(
          res,
          false,
          ResponseCode.NOT_FOUND,
          `Contest ${contestId} not found`,
          null
        );
      }

      const now = new Date();
      const allowedTime = new Date(contest.start_time);
      allowedTime.setMinutes(allowedTime.getMinutes() - 15);

      if (now > allowedTime) {
        return ApiResponse(
          res,
          false,
          ResponseCode.FORBIDDEN,
          "Cannot add category questions within 15 minutes of contest start time",
          null
        );
      }

      const questions = await this.questionsRepository.getItems({
        filter: { category: categoryId },
        sort: {},
        skip: 0,
        limit: 1000,
        textSearch: "",
      });

      const results = await Promise.all(
        questions.items.map(async (question) => {
          return this.questionContestsRepository.insertItem({
            contest: contestId,
            question: question._id,
          });
        })
      );

      return ApiResponse(
        res,
        true,
        ResponseCode.SUCCESS,
        `${results.length} questions from category ${categoryId} added to contest successfully`,
        results
      );
    } catch (error) {
      console.error(
        "Error adding category questions to contest:",
        error.message
      );
      return ApiResponse(
        res,
        false,
        ResponseCode.ERROR,
        "Failed to add category questions to contest",
        null
      );
    }
  }

  // Xóa câu hỏi khỏi contest
  @Delete("/:contestId/questions/:questionId")
  @UseGuards(AdminGuard)
  async removeQuestionFromContest(
    @Param("contestId") contestId: string,
    @Param("questionId") questionId: string,
    @Res() res
  ) {
    try {
      const result = await this.questionContestsRepository.removeMany({
        contest: contestId,
        question: questionId,
      });

      return ApiResponse(
        res,
        true,
        ResponseCode.SUCCESS,
        `Question ${questionId} removed from contest ${contestId} successfully`,
        result
      );
    } catch (error) {
      console.error("Error removing question from contest:", error.message);
      return ApiResponse(
        res,
        false,
        ResponseCode.ERROR,
        "Failed to remove question from contest",
        null
      );
    }
  }

  @Delete("/:contestId/questions")
  @UseGuards(AdminGuard)
  async removeAllQuestionsFromContest(
    @Param("contestId") contestId: string,
    @Res() res
  ) {
    try {
      // Xóa toàn bộ câu hỏi liên kết với contestId
      const result = await this.questionContestsRepository.removeMany({
        contest: contestId,
      });

      return ApiResponse(
        res,
        true,
        ResponseCode.SUCCESS,
        `All questions removed from contest ${contestId} successfully`,
        result
      );
    } catch (error) {
      console.error("Error removing questions from contest:", error.message);
      return ApiResponse(
        res,
        false,
        ResponseCode.ERROR,
        "Failed to remove questions from contest",
        null
      );
    }
  }

  // Lấy danh sách câu hỏi của contest
  @Get("/:contestId/questions")
  @UseGuards(AdminGuard)
  async getQuestionsByContest(
    @Param("contestId") contestId: string,
    @Res() res
  ) {
    try {
      const questions =
        await this.questionContestsRepository.getQuestionsByContest(contestId);

      return ApiResponse(
        res,
        true,
        ResponseCode.SUCCESS,
        `Questions fetched successfully for contest ${contestId}`,
        questions
      );
    } catch (error) {
      console.error("Error fetching questions by contest:", error.message);
      return ApiResponse(
        res,
        false,
        ResponseCode.ERROR,
        "Failed to fetch questions by contest",
        null
      );
    }
  }
}
