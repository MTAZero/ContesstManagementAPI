import { InjectModel } from "@nestjs/mongoose";
import { BaseDBService } from "./base";
import { Injectable } from "@nestjs/common";
import { UserChoice } from "../schemas/user_choices.schema";

@Injectable()
export class UserChoicesRepository extends BaseDBService<UserChoice> {
  constructor(@InjectModel(UserChoice.name) private readonly entityModel) {
    super(entityModel);
  }

  async getItems(query: {
    skip: number;
    limit: number;
    filter?: object;
    sort?: object;
  }): Promise<{
    items: any[];
    total: number;
    size: number;
    page: number;
    offset: number;
  }> {
    const { skip, limit, filter = {}, sort = { _id: 1 } } = query;

    // Aggregate pipeline
    const pipeline: any[] = [
      {
        $match: filter, // Lọc dữ liệu theo filter
      },
      {
        $lookup: {
          from: "answers", // Tên collection của bảng answers
          let: { answerId: "$answer" }, // Truyền giá trị answer từ bảng hiện tại
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", { $toObjectId: "$$answerId" }] }, // So sánh ObjectId
              },
            },
            {
              $project: {
                is_correct: 0, // Loại bỏ trường is_correct
              },
            },
          ],
          as: "answer_detail", // Tên trường chứa kết quả lookup
        },
      },
      {
        $unwind: {
          path: "$answer_detail", // Gỡ mảng thành object nếu có 1 phần tử
          preserveNullAndEmptyArrays: true, // Giữ các bản ghi không có answer
        },
      },
      {
        $sort: sort, // Sắp xếp dữ liệu
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
    const result = await this.entityModel.aggregate(pipeline).exec();

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
