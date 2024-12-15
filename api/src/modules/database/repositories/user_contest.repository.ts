import { InjectModel } from "@nestjs/mongoose";
import { BaseDBService } from "./base";
import { Injectable } from "@nestjs/common";
import { UserContest } from "../schemas/user_contest.schema";
import { QueryParams, ResponseQuery } from "src/interface/i-base-db-service";

@Injectable()
export class UserContestRepository extends BaseDBService<UserContest> {
  constructor(@InjectModel(UserContest.name) private readonly entityModel) {
    super(entityModel);
  }

  async getItems(query: QueryParams): Promise<ResponseQuery<UserContest>> {
    let { sort, filter, skip, limit } = query;

    // Default sorting if not provided
    sort = {
      ...sort,
      ...{ created_date: -1 },
    };

    // Aggregate pipeline
    const pipeline: any[] = [
      {
        $match: filter || {}, // Lọc theo điều kiện
      },
      {
        $lookup: {
          from: "users", // Tên collection của bảng users
          let: { userId: "$user" }, // Truyền giá trị user từ bảng hiện tại
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: ["$_id", { $toObjectId: "$$userId" }] }, // So sánh ObjectId
                    { $eq: ["$_id", "$$userId"] }, // So sánh nếu userId là string
                  ],
                },
              },
            },
            {
              $project: {
                password: 0, // Loại bỏ trường không cần thiết từ user
              },
            },
          ],
          as: "user_detail", // Kết quả lookup sẽ nằm trong user_detail
        },
      },
      {
        $unwind: {
          path: "$user_detail", // Gỡ mảng user_detail thành object
          preserveNullAndEmptyArrays: true, // Giữ lại các bản ghi không có user
        },
      },
      {
        $lookup: {
          from: "contests", // Tên collection của bảng contests
          let: { contestId: "$contest" }, // Truyền giá trị contest từ bảng hiện tại
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: ["$_id", { $toObjectId: "$$contestId" }] }, // So sánh ObjectId
                    { $eq: ["$_id", "$$contestId"] }, // So sánh nếu contestId là string
                  ],
                },
              },
            },
          ],
          as: "contest_detail", // Kết quả lookup sẽ nằm trong contest_detail
        },
      },
      {
        $unwind: {
          path: "$contest_detail", // Gỡ mảng contest_detail thành object
          preserveNullAndEmptyArrays: true, // Giữ lại các bản ghi không có contest
        },
      },
      {
        $sort: sort, // Sắp xếp kết quả
      },
      {
        $skip: skip, // Bỏ qua số lượng bản ghi
      },
      {
        $limit: limit, // Giới hạn số lượng bản ghi
      },
    ];

    // Thực hiện pipeline
    const items = await this.entityModel.aggregate(pipeline).exec();

    // Tính tổng số lượng bản ghi phù hợp filter
    const totalCountPipeline = [
      {
        $match: filter || {}, // Lọc theo điều kiện
      },
      {
        $count: "total",
      },
    ];

    const totalResult = await this.entityModel
      .aggregate(totalCountPipeline)
      .exec();
    const total = totalResult.length > 0 ? totalResult[0].total : 0;

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
