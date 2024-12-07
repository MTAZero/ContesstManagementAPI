import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './users.schema';
import { Contest } from './contests.schema';
import { Question } from './questions.schema';
import { QuestionContest } from './question_contest.schema';

@Schema()
export class UserChoice extends Document<any> {
  _id: Types.ObjectId;

  // Tham chiếu đến User
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  user: Types.ObjectId;

  // Tham chiếu đến Contest
  @Prop({ type: Types.ObjectId, ref: Contest.name, required: true })
  contest: Types.ObjectId;

  // Tham chiếu đến Question
  @Prop({ type: Types.ObjectId, ref: Question.name, required: true })
  question: Types.ObjectId;

  // ID lựa chọn của người dùng (ví dụ: câu trả lời hoặc lựa chọn trong câu hỏi)
  @Prop()
  select_id: string;

  // Tham chiếu đến QuestionContest
  @Prop({ type: Types.ObjectId, ref: QuestionContest.name, required: true })
  question_contest: Types.ObjectId;

  @Prop()
  created_date: number;

  @Prop()
  last_update: number;
}

export const UserChoiceSchema = SchemaFactory.createForClass(UserChoice);