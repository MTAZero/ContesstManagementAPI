import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './users.schema';
import { Contest } from './contests.schema';

@Schema()
export class UserContest extends Document<any> {
  _id: Types.ObjectId;

  // Tham chiếu đến bảng User
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  user: Types.ObjectId;

  // Tham chiếu đến bảng Contest
  @Prop({ type: Types.ObjectId, ref: Contest.name, required: true })
  contest: Types.ObjectId;

  // Kết quả của người dùng trong cuộc thi
  @Prop()
  result: number;

  @Prop()
  created_date: number;

  @Prop()
  last_update: number;

  // Trạng thái nộp bài
  @Prop({ type: Boolean, default: false })
  is_submitted: boolean;
}

export const UserContestSchema = SchemaFactory.createForClass(UserContest);