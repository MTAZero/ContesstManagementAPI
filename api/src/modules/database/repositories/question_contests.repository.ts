import { InjectModel } from "@nestjs/mongoose";
import { BaseDBService } from "./base";
import { Injectable } from "@nestjs/common";
import { Model } from "mongoose"; // Import Model từ mongoose
import { QuestionContest } from "../schemas/question_contest.schema";

@Injectable()
export class QuestionContestsRepository extends BaseDBService<QuestionContest> {
  constructor(
    @InjectModel(QuestionContest.name)
    private readonly questionContestModel: Model<QuestionContest> // Inject model chính xác
  ) {
    super(questionContestModel); // Gọi parent constructor với model
  }

  async getQuestionsByContest(
    contestId: string,
    skip: number = 0,
    limit: number = 1000
  ): Promise<{
    items: any[];
    total: number;
    size: number;
    page: number;
    offset: number;
  }> {
    // Aggregate pipeline
    const queryDb: any = [
      {
        $match: {
          contest: contestId, // Lọc theo contestId
        },
      },
      {
        $lookup: {
          from: "questions", // Tên collection của bảng questions
          let: { questionId: "$question" }, // Truyền giá trị question từ bảng hiện tại
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: ["$_id", { $toObjectId: "$$questionId" }] }, // So sánh ObjectId
                    { $eq: ["$_id", "$$questionId"] }, // So sánh nếu questionId là string
                  ],
                },
              },
            },
          ],
          as: "question_detail", // Tên trường chứa kết quả lookup
        },
      },
      {
        $unwind: {
          path: "$question_detail", // Gỡ mảng thành object nếu có 1 phần tử
          preserveNullAndEmptyArrays: true, // Giữ các bản ghi không có question
        },
      },
      {
        $lookup: {
          from: "categoryquestions", // Tên collection của bảng category_questions
          let: { categoryId: "$question_detail.category" }, // Truyền giá trị category từ bảng question_detail
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: ["$_id", { $toObjectId: "$$categoryId" }] }, // So sánh ObjectId
                    { $eq: ["$_id", "$$categoryId"] }, // So sánh nếu category là string
                  ],
                },
              },
            },
          ],
          as: "category_detail", // Tên trường sau khi lookup
        },
      },
      {
        $unwind: {
          path: "$category_detail", // Gỡ mảng thành object nếu có 1 phần tử
          preserveNullAndEmptyArrays: true, // Giữ các bản ghi không có category
        },
      },
      {
        $lookup: {
          from: "answers", // Tên collection của bảng answers
          localField: "question_detail._id", // Liên kết với trường _id của câu hỏi
          foreignField: "question", // Liên kết với trường question của bảng answers
          as: "answers", // Tên trường sau khi lookup
        },
      },
      {
        $facet: {
          items: [
            { $skip: skip }, // Bỏ qua các bản ghi đầu tiên
            { $limit: limit }, // Lấy số lượng bản ghi giới hạn
          ],
          total: [
            { $count: "total" }, // Đếm tổng số lượng bản ghi
          ],
        },
      },
    ];

    // Thực thi pipeline
    const result = await this.questionContestModel.aggregate(queryDb).exec();

    // Phân tích kết quả
    const items = result[0]?.items || [];
    const total = result[0]?.total[0]?.total || 0;
    const pageIndex = Math.floor(skip / limit) + 1;

    return {
      items,
      total,
      size: limit,
      page: pageIndex,
      offset: skip,
    };
  }
}
