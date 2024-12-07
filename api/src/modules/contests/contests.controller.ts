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
import { JwtAuthGuard } from "../authentication/guards/jwt-auth.guard";
import { UserContestRepository } from "../database/repositories/user_contest.repository";
import { Types } from "mongoose";

@Controller("contests")
export class ContestsController {
  @Inject(ContestsRepository)
  contestsRepository: ContestsRepository;

  @Inject(QuestionContestsRepository)
  questionContestsRepository: QuestionContestsRepository;

  @Inject(QuestionsRepository)
  questionsRepository: QuestionsRepository;

  @Inject(UserContestRepository)
  userContestRepository: UserContestRepository;

  // lấy danh sách các cuộc thi sắp tới đã đăng ký
  @Get("/upcoming-registered")
  @UseGuards(JwtAuthGuard)
  async getUpcomingRegisteredContests(@CurrentUser() user: any, @Res() res) {
    try {
      const now = new Date(); // Thời gian hiện tại
      const oneWeekLater = new Date();
      oneWeekLater.setDate(now.getDate() + 7); // Thời gian 1 tuần sau

      // Tìm tất cả các cuộc thi đã đăng ký của user
      const registeredContests = await this.userContestRepository.getItems({
        skip: 0,
        limit: 1000, // Lấy toàn bộ
        filter: {
          user: user._id,
        },
      });

      console.log(registeredContests);

      // Lấy danh sách ID các cuộc thi đã đăng ký
      const contestIds = registeredContests.items.map((item) => item.contest);

      if (contestIds.length === 0) {
        return ApiResponse(
          res,
          true,
          ResponseCode.SUCCESS,
          "No upcoming registered contests",
          []
        );
      }

      // Chuyển contestIds thành danh sách ObjectId
      const objectIds = contestIds.map((id) => new Types.ObjectId(id));

      // Lấy thông tin các cuộc thi sắp tới
      const upcomingContests = await this.contestsRepository.getItems({
        skip: 0,
        limit: 1000, // Lấy toàn bộ
        sort: { start_time: 1 }, // Sắp xếp theo thời gian tăng dần
        filter: {
          _id: { $in: objectIds },
          start_time: { $gt: now, $lte: oneWeekLater }, // Chỉ lấy các cuộc thi bắt đầu sau thời gian hiện tại
        },
      });

      return ApiResponse(
        res,
        true,
        ResponseCode.SUCCESS,
        "Upcoming registered contests fetched successfully",
        upcomingContests.items
      );
    } catch (error) {
      console.error(
        "Error fetching upcoming registered contests:",
        error.message
      );
      return ApiResponse(
        res,
        false,
        ResponseCode.ERROR,
        "Failed to fetch upcoming registered contests",
        null
      );
    }
  }

  // lấy danh sách các cuộc thi sắp tới
  @Get("/upcoming")
  @UseGuards(JwtAuthGuard)
  async getUpcomingContests(
    @CurrentUser() user: any,
    @Query("isRegistered") isRegistered: string, // Truyền trạng thái lọc
    @Res() res
  ) {
    try {
      const now = new Date(); // Thời gian hiện tại
      const oneWeekLater = new Date();
      oneWeekLater.setDate(now.getDate() + 7); // Thời gian 1 tuần sau

      // Lấy danh sách các cuộc thi trong vòng 1 tuần tới
      const contests = await this.contestsRepository.getItems({
        skip: 0,
        limit: 1000, // Lấy toàn bộ
        sort: { start_time: 1 }, // Sắp xếp theo thời gian tăng dần
        filter: {
          start_time: {
            $gt: now, // Lớn hơn thời gian hiện tại
            $lte: oneWeekLater, // Nhỏ hơn hoặc bằng 1 tuần sau
          },
        },
      });

      // Lấy danh sách các cuộc thi mà user đã đăng ký
      const registrations = await this.userContestRepository.getItems({
        skip: 0,
        limit: 0, // Lấy toàn bộ
        filter: {
          user: user._id,
        },
      });

      const registeredContestIds = registrations.items.map(
        (reg) => reg.contest
      );

      // Lọc các cuộc thi và thêm trạng thái `isRegistered`
      const upcomingContests = contests.items.map((contest) => {
        const allowedRegistrationTime = new Date(contest.start_time);
        allowedRegistrationTime.setMinutes(
          allowedRegistrationTime.getMinutes() - 15
        );

        // Kiểm tra xem user đã đăng ký cuộc thi hay chưa
        const registered = registeredContestIds.some(
          (id) => id.toString() === contest._id.toString()
        );

        return {
          ...contest,
          canRegister: now < allowedRegistrationTime, // Có thể đăng ký
          isRegistered: registered, // Đã đăng ký hay chưa
        };
      });

      // Lọc theo trạng thái `isRegistered` nếu được truyền
      let filteredContests = upcomingContests;
      if (isRegistered === "true") {
        filteredContests = upcomingContests.filter(
          (contest) => contest.isRegistered
        );
      } else if (isRegistered === "false") {
        filteredContests = upcomingContests.filter(
          (contest) => !contest.isRegistered
        );
      }

      return ApiResponse(
        res,
        true,
        ResponseCode.SUCCESS,
        "Upcoming contests fetched successfully",
        filteredContests
      );
    } catch (error) {
      console.error("Error fetching upcoming contests:", error.message);
      return ApiResponse(
        res,
        false,
        ResponseCode.ERROR,
        "Failed to fetch upcoming contests",
        null
      );
    }
  }

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

  // đăng kí
  @Post("/:contestId/register")
  @UseGuards(JwtAuthGuard)
  async registerForContest(
    @Param("contestId") contestId: string,
    @CurrentUser() user: any,
    @Res() res
  ) {
    try {
      const contest = await this.contestsRepository.getItemById(contestId);
      if (!contest) {
        return ApiResponse(
          res,
          false,
          ResponseCode.NOT_FOUND,
          "Contest not found",
          null
        );
      }

      const now = new Date();
      const allowedTime = new Date(contest.start_time);
      allowedTime.setMinutes(allowedTime.getMinutes() - 15); // Trừ 15 phút

      if (now > allowedTime) {
        return ApiResponse(
          res,
          false,
          ResponseCode.FORBIDDEN,
          "Cannot register within 15 minutes of contest start time",
          null
        );
      }

      // Kiểm tra nếu user đã đăng ký
      const existingRegistration = await this.userContestRepository.getItems({
        skip: 0,
        limit: 1,
        filter: {
          contest: contestId,
          user: user._id,
        },
      });

      if (existingRegistration.items.length > 0) {
        return ApiResponse(
          res,
          false,
          ResponseCode.CONFLICT,
          "You have already registered for this contest",
          null
        );
      }

      const result = await this.userContestRepository.insertItem({
        contest: contestId,
        user: user._id,
      });

      return ApiResponse(
        res,
        true,
        ResponseCode.SUCCESS,
        "Registered successfully",
        result
      );
    } catch (error) {
      console.error("Error registering for contest:", error.message);
      return ApiResponse(
        res,
        false,
        ResponseCode.ERROR,
        "Failed to register for contest",
        null
      );
    }
  }

  // huỷ đăng kí
  @Delete("/:contestId/register")
  @UseGuards(JwtAuthGuard)
  async unregisterFromContest(
    @Param("contestId") contestId: string,
    @CurrentUser() user: any,
    @Res() res
  ) {
    try {
      const contest = await this.contestsRepository.getItemById(contestId);
      if (!contest) {
        return ApiResponse(
          res,
          false,
          ResponseCode.NOT_FOUND,
          "Contest not found",
          null
        );
      }

      const now = new Date();
      const allowedTime = new Date(contest.start_time);
      allowedTime.setMinutes(allowedTime.getMinutes() - 15); // Trừ 15 phút

      if (now > allowedTime) {
        return ApiResponse(
          res,
          false,
          ResponseCode.FORBIDDEN,
          "Cannot unregister within 15 minutes of contest start time",
          null
        );
      }

      // Kiểm tra nếu user chưa đăng ký
      const existingRegistration = await this.userContestRepository.getItems({
        skip: 0,
        limit: 1,
        filter: {
          contest: contestId,
          user: user._id,
        },
      });

      if (existingRegistration.items.length === 0) {
        return ApiResponse(
          res,
          false,
          ResponseCode.NOT_FOUND,
          "You have not registered for this contest",
          null
        );
      }

      const result = await this.userContestRepository.removeMany({
        contest: contestId,
        user: user._id,
      });

      return ApiResponse(
        res,
        true,
        ResponseCode.SUCCESS,
        "Unregistered successfully",
        result
      );
    } catch (error) {
      console.error("Error unregistering from contest:", error.message);
      return ApiResponse(
        res,
        false,
        ResponseCode.ERROR,
        "Failed to unregister from contest",
        null
      );
    }
  }

  // lấy danh sách người dùng đã đăng kí cuộc thi
  @Get("/:contestId/registrations")
  @UseGuards(AdminGuard)
  async getRegistrationsByContest(
    @Param("contestId") contestId: string,
    @Query("skip") skip: number = 0,
    @Query("limit") limit: number = 10,
    @Res() res
  ) {
    try {
      // Kiểm tra xem cuộc thi có tồn tại hay không
      const contest = await this.contestsRepository.getItemById(contestId);
      if (!contest) {
        return ApiResponse(
          res,
          false,
          ResponseCode.NOT_FOUND,
          "Contest not found",
          null
        );
      }

      // Lấy danh sách user đã đăng ký cuộc thi
      const registrations = await this.userContestRepository.getItems({
        skip: Number(skip), // Bỏ qua số bản ghi
        limit: Number(limit), // Số bản ghi cần lấy
        filter: { contest: contestId }, // Lọc theo contestId
        sort: { created_date: -1 }, // Sắp xếp theo ngày đăng ký giảm dần
      });

      // Tổng số lượng user đã đăng ký
      const total = registrations.total;

      // Trả về danh sách user cùng tổng số lượng
      return ApiResponse(
        res,
        true,
        ResponseCode.SUCCESS,
        "Registrations fetched successfully",
        {
          items: registrations.items,
          total,
          size: limit,
          page: Math.floor(Number(skip) / Number(limit)) + 1,
          offset: skip,
        }
      );
    } catch (error) {
      console.error("Error fetching registrations:", error.message);
      return ApiResponse(
        res,
        false,
        ResponseCode.ERROR,
        "Failed to fetch registrations",
        null
      );
    }
  }
}
