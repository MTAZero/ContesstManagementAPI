import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseDBService } from "./base";
import { Question } from "../schemas/questions.schema";
import { QueryParams, ResponseQuery } from "src/interface/i-base-db-service";
import { CategoryQuestion } from "../schemas/category_questions.schema";

@Injectable()
export class QuestionsRepository extends BaseDBService<Question> {
  constructor(
    @InjectModel(Question.name) private readonly questionModel: Model<Question>
  ) {
    super(questionModel);
  }

  async getItems(query: QueryParams): Promise<ResponseQuery<Question>> {
    let { sort, filter } = query;
    const { textSearch, skip, limit } = query;

    if (textSearch && textSearch !== "") {
      filter = {
        ...filter,
        ...{
          $text: {
            $search: `"${textSearch}"`,
          },
        },
      };
    }

    sort = {
      ...sort,
      ...{
        _id: 1,
      },
    };

    // Aggregate pipeline
    const queryDb: any = [
      {
        $match: filter, // Lọc dữ liệu
      },
      {
        $lookup: {
          from: "categoryquestions", // Tên collection của bảng category_questions
          let: { categoryId: "$category" }, // Truyền giá trị category từ bảng hiện tại
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
          localField: "_id", // Liên kết với trường _id của câu hỏi
          foreignField: "question", // Liên kết với trường questionId của bảng answers
          as: "answers", // Tên trường sau khi lookup
        },
      },
      {
        $sort: sort, // Sắp xếp dữ liệu
      },
      {
        $skip: skip, // Bỏ qua số lượng bản ghi
      },
      {
        $limit: limit, // Lấy số lượng bản ghi giới hạn
      },
    ];

    const ans = await this.questionModel.aggregate(queryDb).exec();

    // Tính tổng số lượng bản ghi phù hợp filter
    const res_total = await this.questionModel.aggregate([
      {
        $match: filter,
      },
      {
        $count: "total",
      },
    ]);

    const total = res_total[0] ? res_total[0].total : 0;
    const pageIndex = skip / limit + 1;

    return {
      items: ans,
      total: total,
      size: limit,
      page: pageIndex,
      offset: skip,
    };
  }

  async getItemById(id: any): Promise<any> {
    // Aggregate pipeline
    const queryDb: any = [
      {
        $match: { _id: new this.questionModel.base.Types.ObjectId(id) }, // Lọc theo _id
      },
      {
        $lookup: {
          from: "categoryquestions", // Tên collection của bảng category_questions
          let: { categoryId: "$category" }, // Truyền giá trị category từ bảng hiện tại
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
          localField: "_id", // Liên kết với trường _id của câu hỏi
          foreignField: "question", // Liên kết với trường questionId của bảng answers
          as: "answers", // Tên trường sau khi lookup
        },
      },
    ];

    // Thực thi pipeline
    const result = await this.questionModel.aggregate(queryDb).exec();

    // Trả về phần tử đầu tiên nếu có, hoặc null nếu không tìm thấy
    return result.length > 0 ? result[0] : null;
  }
}
