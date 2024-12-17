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
import { ObjectId } from "mongodb";
import { UserChoicesRepository } from "../database/repositories/user_choices.repository";
import { AnswerRepository } from "../database/repositories/answers.repository";
import { UserRepository } from "../database/repositories/users.repository";

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

  @Inject(UserChoicesRepository)
  userChoiceRepository: UserChoicesRepository;

  @Inject(AnswerRepository)
  answersRepository: AnswerRepository;

  @Inject(UserRepository)
  usersRepository: UserRepository;

  @Get("/user-contest")
  @UseGuards(JwtAuthGuard)
  async getContestsForUser(
    @Res() res,
    @Req() req,
    @Query("status") status: string, // Lọc theo trạng thái
    @Query("keyword") keyword: string // Tìm kiếm theo keyword
  ) {
    try {
      const now = new Date();
      const pagination: PaginationType = req.pagination; // Phân trang
      const sort = req.sort || { start_time: -1 }; // Sắp xếp giảm dần theo start_time

      // Lấy tất cả cuộc thi user đã đăng ký
      const userContests = await this.userContestRepository.getItems({
        skip: 0,
        limit: 1000,
        filter: { user: req.user._id },
      });

      const contestIds = userContests.items.map((uc) => uc.contest);

      // Tạo bộ lọc dựa trên trạng thái và tìm kiếm
      const filter: any = {};
      if (status && status !== "ALL") {
        if (status === "UPCOMING") {
          filter.start_time = { $gt: now };
        } else if (status === "REGISTERED") {
          filter._id = { $in: contestIds };
        } else if (status === "COMPLETED") {
          filter._id = { $in: contestIds };
          filter["user_contests.is_submitted"] = true;
        } else if (status === "ENDED") {
          filter.end_time = { $lt: now };
        }
      }

      // Thêm tìm kiếm theo keyword
      if (keyword) {
        filter.$or = [
          { name: { $regex: keyword, $options: "i" } }, // Tìm kiếm tên cuộc thi
          { description: { $regex: keyword, $options: "i" } }, // Tìm kiếm mô tả
        ];
      }

      // Lấy danh sách cuộc thi từ repository
      const contests = await this.contestsRepository.getItems({
        skip: pagination.skip,
        limit: pagination.limit,
        filter,
        sort,
      });

      // Tạo map kiểm tra trạng thái đã đăng ký và nộp bài
      const userContestMap = new Map(
        userContests.items.map((uc) => [uc.contest.toString(), uc])
      );

      // Xử lý kết quả trả về
      const processedContests = contests.items.map((contest) => {
        const userContest = userContestMap.get(contest._id.toString());
        return {
          ...contest,
          is_registered: !!userContest,
          is_submitted: userContest?.is_submitted || false,
          status: userContest?.is_submitted
            ? "COMPLETED"
            : new Date(contest.start_time) > now
              ? "UPCOMING"
              : new Date(contest.end_time) < now
                ? "ENDED"
                : "REGISTERED",
        };
      });

      // Trả về kết quả với phân trang
      return ApiResponse(
        res,
        true,
        ResponseCode.SUCCESS,
        "Contests fetched successfully",
        {
          items: processedContests,
          total: contests.total,
          size: pagination.limit,
          page: Math.floor(pagination.skip / pagination.limit) + 1,
          offset: pagination.skip,
        }
      );
    } catch (error) {
      console.error("Error fetching contests for user:", error.message);
      return ApiResponse(
        res,
        false,
        ResponseCode.ERROR,
        "Failed to fetch contests for user",
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
        limit: 1000, // Lấy toàn bộ
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

      const existingQuestions = await this.questionContestsRepository.getItems({
        filter: { contest: new ObjectId(contestId) },
        skip: 0,
        limit: 1000,
      });

      const existingQuestionIds = new Set(
        existingQuestions.items.map((q: any) => q.question.toString())
      );

      const questionsToAdd = questionIds.filter(
        (id) => !existingQuestionIds.has(id)
      );

      if (questionsToAdd.length === 0) {
        return ApiResponse(
          res,
          true,
          ResponseCode.SUCCESS,
          "No new questions to add to the contest",
          []
        );
      }

      const results = await Promise.all(
        questionsToAdd.map(async (questionId) => {
          return this.questionContestsRepository.insertItem({
            contest: new ObjectId(contestId),
            question: new ObjectId(questionId),
          });
        })
      );

      return ApiResponse(
        res,
        true,
        ResponseCode.SUCCESS,
        `${results.length} new questions added to contest successfully`,
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

      const existingQuestions = await this.questionContestsRepository.getItems({
        filter: { contest: new ObjectId(contestId) },
        skip: 0,
        limit: 1000,
      });

      const existingQuestionIds = new Set(
        existingQuestions.items.map((q: any) => q.question.toString())
      );

      const questions = await this.questionsRepository.getItems({
        filter: { category: categoryId },
        sort: {},
        skip: 0,
        limit: 1000,
        textSearch: "",
      });

      const questionsToAdd = questions.items.filter(
        (q: any) => !existingQuestionIds.has(q._id.toString())
      );

      if (questionsToAdd.length === 0) {
        return ApiResponse(
          res,
          true,
          ResponseCode.SUCCESS,
          "No new questions to add from this category to the contest",
          []
        );
      }

      const results = await Promise.all(
        questionsToAdd.map(async (question) => {
          return this.questionContestsRepository.insertItem({
            contest: new ObjectId(contestId),
            question: question._id,
          });
        })
      );

      return ApiResponse(
        res,
        true,
        ResponseCode.SUCCESS,
        `${results.length} new questions from category ${categoryId} added to contest successfully`,
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
        contest: new ObjectId(contestId),
        question: new ObjectId(questionId),
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
        contest: new ObjectId(contestId),
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
    @Res() res,
    @Req() req
  ) {
    const pagination: PaginationType = req.pagination;
    const sort = req.sort;

    const filter: any = { contest: new ObjectId(contestId) }; // Lọc theo contestId

    const data = await this.questionContestsRepository.getItems({
      filter,
      sort,
      skip: pagination.skip,
      limit: pagination.limit,
    });

    return ApiResponse(
      res,
      true,
      ResponseCode.SUCCESS,
      `Questions fetched successfully for contest ${contestId}`,
      data
    );
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
          contest: new ObjectId(contestId),
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
        contest: new ObjectId(contestId),
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
          contest: new ObjectId(contestId),
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
        contest: new ObjectId(contestId),
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
    @Query("page") page: number = 1,
    @Query("pageSize") pageSize: number = 10,
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

      // Tính toán skip và limit từ page và pageSize
      const skip = (Number(page) - 1) * Number(pageSize);
      const limit = Number(pageSize);

      // Lấy danh sách user đã đăng ký cuộc thi
      const registrations = await this.userContestRepository.getItems({
        skip,
        limit,
        filter: { contest: new ObjectId(contestId) }, // Lọc theo contestId
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
          size: pageSize,
          page,
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

  @Post("/:contestId/enter")
  @UseGuards(JwtAuthGuard)
  async enterContest(
    @Param("contestId") contestId: string,
    @CurrentUser() user: any,
    @Res() res
  ) {
    try {
      const now = new Date();

      // Lấy thông tin cuộc thi
      const contest = await this.contestsRepository.getItems({
        skip: 0,
        limit: 1,
        filter: {
          _id: new ObjectId(contestId),
        },
      });

      if (!contest.items.length) {
        return ApiResponse(
          res,
          false,
          ResponseCode.NOT_FOUND,
          "Contest not found",
          null
        );
      }

      const contestData = contest.items[0];
      const startTime = new Date(contestData.start_time);
      const endTime = new Date(
        startTime.getTime() + contestData.duration * 60000
      );

      // Kiểm tra thời gian: phải trong khoảng start_time -> end_time
      if (now < startTime) {
        return ApiResponse(
          res,
          false,
          ResponseCode.FORBIDDEN,
          "Contest has not started yet",
          null
        );
      }

      if (now > endTime) {
        return ApiResponse(
          res,
          false,
          ResponseCode.FORBIDDEN,
          "Contest has already ended",
          null
        );
      }

      // Kiểm tra xem user đã đăng ký chưa
      const registration = await this.userContestRepository.getItems({
        skip: 0,
        limit: 1,
        filter: { contest: new ObjectId(contestId), user: user._id },
      });

      if (!registration.items.length) {
        return ApiResponse(
          res,
          false,
          ResponseCode.FORBIDDEN,
          "You are not registered for this contest",
          null
        );
      }

      const userContest = registration.items[0];

      // Nếu đã có start_time, trả về thông báo đã bắt đầu thi
      if (userContest.start_time) {
        return ApiResponse(
          res,
          false,
          ResponseCode.FORBIDDEN,
          "You have already started the contest",
          null
        );
      }

      // Cập nhật start_time nếu chưa có
      await this.userContestRepository.updateItem(userContest._id, {
        start_time: now,
        last_update: Date.now(),
      });

      // Lấy danh sách câu hỏi của cuộc thi
      const questions =
        await this.questionContestsRepository.getQuestionsByContest(contestId);

      // Lấy danh sách lựa chọn hiện tại của user
      const userChoices = await this.userChoiceRepository.getItems({
        skip: 0,
        limit: 1000,
        filter: {
          contest: new ObjectId(contestId),
          user: user._id,
        },
      });

      // Tạo map để tra cứu câu trả lời của user
      const userChoicesMap = new Map(
        userChoices.items.map((choice) => [choice.question.toString(), choice])
      );

      // Xáo trộn thứ tự câu hỏi và đáp án
      const shuffledQuestions = questions.items.map((question, index) => ({
        ...question,
        pos: index + 1,
        answers: question.answers
          .sort(() => Math.random() - 0.5)
          .map((answer) => ({
            _id: answer._id,
            content: answer.content,
          })),
        user_choice: userChoicesMap.get(question.question.toString()) || null, // Thêm lựa chọn hiện tại của user
      }));

      return ApiResponse(
        res,
        true,
        ResponseCode.SUCCESS,
        "Entered contest and questions fetched successfully",
        shuffledQuestions
      );
    } catch (error) {
      console.error("Error entering contest:", error.message);
      return ApiResponse(
        res,
        false,
        ResponseCode.ERROR,
        "Failed to enter contest",
        null
      );
    }
  }

  // user cập nhật lựa chọn
  @Post("/:contestId/question/:questionId/answer")
  @UseGuards(JwtAuthGuard)
  async updateAnswer(
    @Param("contestId") contestId: string,
    @Param("questionId") questionId: string,
    @CurrentUser() user: any,
    @Body() body: { answerId: string },
    @Res() res
  ) {
    try {
      const now = new Date();

      // Lấy thông tin cuộc thi
      const contest = await this.contestsRepository.getItems({
        skip: 0,
        limit: 1,
        filter: { _id: new ObjectId(contestId) },
      });

      if (!contest.items.length) {
        return ApiResponse(
          res,
          false,
          ResponseCode.NOT_FOUND,
          "Contest not found",
          null
        );
      }

      // Kiểm tra xem cuộc thi đã kết thúc hay chưa
      if (now > new Date(contest.items[0].end_time)) {
        return ApiResponse(
          res,
          false,
          ResponseCode.FORBIDDEN,
          "Contest has ended",
          null
        );
      }

      // Kiểm tra xem user đã đăng ký chưa
      const registration = await this.userContestRepository.getItems({
        skip: 0,
        limit: 1,
        filter: { contest: new ObjectId(contestId), user: user._id },
      });

      if (!registration.items.length) {
        return ApiResponse(
          res,
          false,
          ResponseCode.FORBIDDEN,
          "You are not registered for this contest",
          null
        );
      }

      // Lấy thông tin `question_contest`
      const questionContest = await this.questionContestsRepository.getItems({
        skip: 0,
        limit: 1,
        filter: {
          contest: new ObjectId(contestId),
          question: new ObjectId(questionId),
        },
      });

      if (!questionContest.items.length) {
        return ApiResponse(
          res,
          false,
          ResponseCode.NOT_FOUND,
          "Question is not part of this contest",
          null
        );
      }

      const questionContestId = questionContest.items[0]._id;

      // Kiểm tra xem đã tồn tại câu trả lời hay chưa
      const existingChoice = await this.userChoiceRepository.getItems({
        skip: 0,
        limit: 1,
        filter: { question_contest: questionContestId, user: user._id },
      });

      let result;
      if (existingChoice.items.length) {
        // Cập nhật lựa chọn nếu đã tồn tại
        result = await this.userChoiceRepository.updateItem(
          existingChoice.items[0]._id,
          {
            answer: body.answerId,
          }
        );
      } else {
        // Tạo mới nếu chưa có
        result = await this.userChoiceRepository.insertItem({
          question_contest: questionContestId,
          contest: new ObjectId(contestId),
          question: new ObjectId(questionId),
          user: user._id,
          answer: new ObjectId(body.answerId),
        });
      }

      return ApiResponse(
        res,
        true,
        ResponseCode.SUCCESS,
        "Answer saved successfully",
        result
      );
    } catch (error) {
      console.error("Error updating answer:", error.message);
      return ApiResponse(
        res,
        false,
        ResponseCode.ERROR,
        "Failed to save answer",
        null
      );
    }
  }

  // user nộp bài và tính điểm cho user
  @Post("/:contestId/submit")
  @UseGuards(JwtAuthGuard)
  async submitContest(
    @Param("contestId") contestId: string,
    @CurrentUser() user: any,
    @Res() res
  ) {
    try {
      const now = new Date();

      // Lấy thông tin cuộc thi
      const contest = await this.contestsRepository.getItems({
        skip: 0,
        limit: 1,
        filter: { _id: new ObjectId(contestId) },
      });

      if (!contest.items.length) {
        return ApiResponse(
          res,
          false,
          ResponseCode.NOT_FOUND,
          "Contest not found",
          null
        );
      }

      const contestData = contest.items[0];

      // Lấy thông tin đăng ký của user
      const registration = await this.userContestRepository.getItems({
        skip: 0,
        limit: 1,
        filter: { contest: new ObjectId(contestId), user: user._id },
      });

      if (!registration.items.length) {
        return ApiResponse(
          res,
          false,
          ResponseCode.FORBIDDEN,
          "You are not registered for this contest",
          null
        );
      }

      const userRegistration = registration.items[0];

      // Kiểm tra xem đã nộp bài hay chưa
      if (userRegistration.is_submitted) {
        return ApiResponse(
          res,
          false,
          ResponseCode.FORBIDDEN,
          "You have already submitted the contest",
          null
        );
      }

      // Kiểm tra thời gian nộp bài hợp lệ
      const startTime = new Date(userRegistration.start_time);
      const submissionDeadline = new Date(
        startTime.getTime() + contestData.duration * 60000 + 2 * 60000
      ); // Thêm 2 phút

      if (now > submissionDeadline) {
        return ApiResponse(
          res,
          false,
          ResponseCode.FORBIDDEN,
          "Submission time has expired",
          null
        );
      }

      // Lấy câu trả lời của user
      const userChoices = await this.userChoiceRepository.getItems({
        skip: 0,
        limit: 1000,
        filter: { contest: new ObjectId(contestId), user: user._id },
      });

      let score = 0;

      // Tính điểm dựa trên câu trả lời đúng
      for (const choice of userChoices.items) {
        const correctAnswer = await this.answersRepository.getItems({
          skip: 0,
          limit: 1,
          filter: { question: choice.question, is_correct: true },
        });

        if (
          correctAnswer.items.length &&
          correctAnswer.items[0]._id.toString() === choice.answer.toString()
        ) {
          score++;
        }
      }

      // Cập nhật trạng thái nộp bài và kết quả
      await this.userContestRepository.updateItem(userRegistration._id, {
        is_submitted: true,
        result: score,
        last_update: Date.now(),
      });

      return ApiResponse(
        res,
        true,
        ResponseCode.SUCCESS,
        "Contest submitted successfully",
        { score }
      );
    } catch (error) {
      console.error("Error submitting contest:", error.message);
      return ApiResponse(
        res,
        false,
        ResponseCode.ERROR,
        "Failed to submit contest",
        null
      );
    }
  }

  // kết quả của user
  @Get("/:contestId/result")
  @UseGuards(JwtAuthGuard)
  async getContestResult(
    @Param("contestId") contestId: string,
    @CurrentUser() user: any,
    @Res() res
  ) {
    try {
      // Lấy thông tin đăng ký của user
      const registration = await this.userContestRepository.getItems({
        skip: 0,
        limit: 1,
        filter: { contest: new ObjectId(contestId), user: user._id },
      });

      if (!registration.items.length) {
        return ApiResponse(
          res,
          false,
          ResponseCode.NOT_FOUND,
          "You are not registered for this contest",
          null
        );
      }

      const userRegistration = registration.items[0];

      // Kiểm tra xem user đã nộp bài chưa
      if (!userRegistration.is_submitted) {
        return ApiResponse(
          res,
          false,
          ResponseCode.FORBIDDEN,
          "You have not submitted the contest yet",
          null
        );
      }

      return ApiResponse(
        res,
        true,
        ResponseCode.SUCCESS,
        "Contest result fetched successfully",
        { score: userRegistration.result }
      );
    } catch (error) {
      console.error("Error fetching contest result:", error.message);
      return ApiResponse(
        res,
        false,
        ResponseCode.ERROR,
        "Failed to fetch contest result",
        null
      );
    }
  }

  // leader board của q cuộc thi
  @Get("/:contestId/leaderboard")
  @UseGuards(JwtAuthGuard)
  async getLeaderboard(@Param("contestId") contestId: string, @Res() res) {
    try {
      // Lấy danh sách các user đã tham gia và nộp bài
      const userResults = await this.userContestRepository.getItems({
        skip: 0,
        limit: 1000,
        filter: {
          contest: new ObjectId(contestId),
          is_submitted: true,
        },
        sort: { result: -1 }, // Sắp xếp theo điểm số giảm dần
      });

      // Lấy chi tiết user
      const userIds = userResults.items.map((item) => item.user);
      const users = await this.usersRepository.getItems({
        skip: 0,
        limit: 1000,
        filter: { _id: { $in: userIds } },
      });

      const leaderboard = userResults.items.map((entry, index) => ({
        rank: index + 1,
        user: users.items.find(
          (user) => user._id.toString() === entry.user.toString()
        ),
        score: entry.result,
      }));

      return ApiResponse(
        res,
        true,
        ResponseCode.SUCCESS,
        "Leaderboard fetched successfully",
        leaderboard
      );
    } catch (error) {
      console.error("Error fetching leaderboard:", error.message);
      return ApiResponse(
        res,
        false,
        ResponseCode.ERROR,
        "Failed to fetch leaderboard",
        null
      );
    }
  }
}
