import { Injectable } from "@nestjs/common";
import { Model, Document } from "mongoose";
import {
  IBaseDBService,
  QueryParams,
  ResponseQuery,
} from "src/interface/i-base-db-service";

@Injectable()
export class BaseDBService<T extends Document> implements IBaseDBService<T> {
  constructor(private readonly model: Model<T>) {}

  async getItems(query: QueryParams): Promise<ResponseQuery<T>> {
    let { sort, filter } = query;
    let { textSearch, skip, limit } = query;

    if (limit === 0) limit = 1000;

    if (textSearch && textSearch !== "")
      filter = {
        ...filter,
        ...{
          $text: {
            $search: `"${textSearch}"`,
          },
        },
      };

    sort = {
      ...sort,
      ...{
        created_date: -1,
      },
    };

    const queryDb: any = [
      {
        $match: filter,
      },
      {
        $project: {
          password: 0,
        },
      },
      {
        $sort: sort,
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ];

    const ans = await this.model.aggregate(queryDb).exec();
    const res_total = await this.model.aggregate([
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
    return await this.model.findById(id, { password: 0 }).lean().exec();
  }

  async updateItem(id: any, entity: any): Promise<any> {
    entity.last_update = new Date().getTime();

    // Xóa trường _id nếu tồn tại trong dữ liệu cập nhật
    if (entity._id) {
      delete entity._id;
    }

    await this.model
      .updateOne(
        {
          _id: id,
        },
        entity
      )
      .exec();

    return await this.model.findById(id).lean().exec();
  }

  async removeItem(id: any): Promise<boolean> {
    await this.model
      .deleteOne({
        _id: id,
      })
      .exec();

    return true;
  }

  async insertItem(entity: any): Promise<any> {
    entity.created_date = new Date().getTime();
    entity.last_update = new Date().getTime();
    const _entity = new this.model(entity);
    return _entity.save();
  }

  async getFirstItem(query: object = {}, sort: any = { _id: 1 }) {
    const ans = await this.model
      .find(query, { password: 0 })
      .sort(sort)
      .limit(1)
      .lean()
      .exec();
    const res = ans[0];
    return res;
  }

  async removeMany(query: object = {}): Promise<boolean> {
    await this.model.deleteMany(query).exec();
    return true;
  }

  async updateMany(query: object = {}, entity: any) {
    entity.last_update = new Date().getTime();
    const ans = await this.model.updateMany(query, entity);
    return ans;
  }

  async countByFilter(filter) {
    const ans = await this.model
      .aggregate([
        {
          $match: filter,
        },
        {
          $count: "total",
        },
      ])
      .exec();

    return ans[0] ? ans[0].total : 0;
  }
}
