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
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from "@nestjs/common";
import { ResponseCode, ResponseMessage } from "src/const";
import { ApiResponse, multerOptions } from "src/utils";

import { PaginationType } from "src/middleware";
import { CreateQuestionDto } from "./dtos/create-question.dto";
import { UpdateQuestionDto } from "./dtos/update-question.dto";
import { AdminGuard } from "../authentication/guards/admin-auth.guard";
import { QuestionsRepository } from "../database/repositories/questions.respository";
import { FileInterceptor } from "@nestjs/platform-express";
import { AnswerRepository } from "../database/repositories/answers.repository";
import * as xlsx from "xlsx";
import * as fs from "fs";
import { UploadedMulterFile } from "src/types";

@Controller("questions")
export class QuestionsController {
  @Inject(QuestionsRepository)
  questionsRepository: QuestionsRepository;

  @Inject(AnswerRepository)
  answersRepository: AnswerRepository;

  @Get("/")
  @UseGuards(AdminGuard)
  async getListQuestions(
    @Res() res,
    @Req() req,
    @Query("category") category: string, // Lấy tham số category từ query string
    @Query() query
  ) {
    const pagination: PaginationType = req.pagination;
    const sort = req.sort;

    // Bổ sung điều kiện lọc theo category
    const filter: any = {};
    if (category) {
      filter.category = category; // Lọc theo category nếu có
    }

    const data = await this.questionsRepository.getItems({
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
  async insertQuestion(
    @Body(new ValidationPipe()) entity: CreateQuestionDto,
    @Res() res
  ) {
    // Tách thông tin câu trả lời (answers) từ entity
    const { answers, ...questionData } = entity;

    // Tạo câu hỏi mới
    const createdQuestion =
      await this.questionsRepository.insertItem(questionData);

    // Lưu từng câu trả lời vào bảng `answers`
    if (answers && answers.length > 0) {
      const answerPromises = answers.map((answer) =>
        this.answersRepository.insertItem({
          ...answer,
          question: createdQuestion._id, // Liên kết câu trả lời với câu hỏi
        })
      );
      await Promise.all(answerPromises);
    }

    // Trả về kết quả
    return ApiResponse(
      res,
      true,
      ResponseCode.SUCCESS,
      ResponseMessage.SUCCESS,
      createdQuestion
    );
  }

  @Put("/:id")
  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor("file"))
  async updateQuestion(
    @Body(new ValidationPipe()) entity: UpdateQuestionDto,
    @Res() res,
    @Param() params
  ) {
    const id = params.id;
    const ans = await this.questionsRepository.updateItem(id, entity);
    return ApiResponse(
      res,
      true,
      ResponseCode.SUCCESS,
      ResponseMessage.SUCCESS,
      ans
    );
  }

  @Delete("/:id")
  @UseGuards(AdminGuard)
  async removeQuestion(@Res() res, @Param() params) {
    const id = params.id;
    const ans = await this.questionsRepository.removeItem(id);
    return ApiResponse(
      res,
      true,
      ResponseCode.SUCCESS,
      ResponseMessage.SUCCESS,
      ans
    );
  }

  @Get("/:id")
  @UseGuards(AdminGuard)
  async getDetailQuestion(@Res() res, @Param() params) {
    const id = params.id;
    const ans = await this.questionsRepository.getItemById(id);
    return ApiResponse(
      res,
      true,
      ResponseCode.SUCCESS,
      ResponseMessage.SUCCESS,
      ans
    );
  }

  @Post("/import")
  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor("file", multerOptions))
  async importQuestions(@UploadedFile() file: UploadedMulterFile, @Res() res) {
    try {
      console.log("Uploaded File:", file);

      // Kiểm tra nếu không có file được tải lên
      if (!file || !file.path) {
        return ApiResponse(
          res,
          false,
          ResponseCode.BAD_REQUEST,
          "File is required",
          null
        );
      }

      // Đọc dữ liệu từ file Excel
      const workbook = xlsx.readFile(file.path);
      const sheetName = workbook.SheetNames[0]; // Lấy sheet đầu tiên
      if (!sheetName) {
        return ApiResponse(
          res,
          false,
          ResponseCode.BAD_REQUEST,
          "No sheets found in the Excel file",
          null
        );
      }

      const sheet = workbook.Sheets[sheetName];
      const rows = xlsx.utils.sheet_to_json(sheet);
      if (rows.length === 0) {
        return ApiResponse(
          res,
          false,
          ResponseCode.BAD_REQUEST,
          "The sheet is empty",
          null
        );
      }

      // Xử lý dữ liệu từ Excel
      const questions = rows.map((row: any) => ({
        content: row["Content"],
        description: row["Description"] || "",
        category: row["Category"], // Lấy ID của category
        answers: [
          { content: row["Answer 1"], is_correct: row["Correct 1"] === "true" },
          { content: row["Answer 2"], is_correct: row["Correct 2"] === "true" },
          { content: row["Answer 3"], is_correct: row["Correct 3"] === "true" },
          { content: row["Answer 4"], is_correct: row["Correct 4"] === "true" },
        ].filter((answer) => answer.content), // Chỉ giữ câu trả lời có nội dung
      }));

      // Lưu dữ liệu vào database
      for (const question of questions) {
        // Tạo câu hỏi
        const createdQuestion = await this.questionsRepository.insertItem({
          content: question.content,
          description: question.description,
          category: question.category,
        });

        // Lưu câu trả lời
        if (question.answers.length > 0) {
          await Promise.all(
            question.answers.map((answer) =>
              this.answersRepository.insertItem({
                ...answer,
                ...{
                  question: createdQuestion._id,
                  description: ''
                },
              })
            )
          );
        }
      }

      // Phản hồi thành công
      return ApiResponse(
        res,
        true,
        ResponseCode.SUCCESS,
        questions,
        null
      );
    } catch (error) {
      console.error("Error during question import:", error.message);
      return ApiResponse(
        res,
        false,
        ResponseCode.ERROR,
        "Failed to import questions",
        null
      );
    } finally {
      // Xóa file tạm nếu có path
      if (file && file.path) {
        try {
          fs.unlinkSync(file.path);
          console.log("Temporary file deleted:", file.path);
        } catch (unlinkError) {
          console.error(
            "Failed to delete temporary file:",
            unlinkError.message
          );
        }
      }
    }
  }
}
