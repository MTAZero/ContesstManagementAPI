import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Question } from './questions.schema';
import { Contest } from './contests.schema';

@Schema()
export class QuestionContest extends Document<any> {
  _id: Types.ObjectId;

  // Tham chiếu đến câu hỏi (Question)
  @Prop({ type: Types.ObjectId, ref: Question.name, required: true })
  question: Types.ObjectId;

  // Tham chiếu đến cuộc thi (Contest)
  @Prop({ type: Types.ObjectId, ref: Contest.name, required: true })
  contest: Types.ObjectId;

  @Prop()
  created_date: number;

  @Prop()
  last_update: number;
}

export const QuestionContestSchema = SchemaFactory.createForClass(QuestionContest);

// Middleware để cập nhật `last_update` tự động trước khi lưu hoặc cập nhật
QuestionContestSchema.pre('save', function (next) {
  this.last_update = new Date().getTime();
  next();
});

QuestionContestSchema.pre('findOneAndUpdate', function (next) {
  this.set({ last_update: new Date() });
  next();
});