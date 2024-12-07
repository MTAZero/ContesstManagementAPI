import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Question } from './questions.schema';
import { IsCorrectEnum } from 'src/enums';

@Schema()
export class Answer extends Document<any> {
  _id: Types.ObjectId;

  @Prop()
  content: string;

  @Prop()
  description: string;

  @Prop({ type: Boolean, default: false })
  is_correct: boolean;

  @Prop({ type: Types.ObjectId, ref: Question.name })
  question: Types.ObjectId;

  @Prop()
  created_date: number;

  @Prop()
  last_update: number;
}

export const AnswerSchema = SchemaFactory.createForClass(Answer);

AnswerSchema.index({
  content: 'text',
  description: 'text',
  is_correct: 'text'
});
