import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { CategoryQuestion } from './category_questions.schema';

@Schema()
export class Question extends Document<any> {
  _id: Types.ObjectId;

  @Prop()
  content: string;

  @Prop()
  description: string;

  @Prop({ type: Types.ObjectId, ref: CategoryQuestion.name })
  category: Types.ObjectId;

  @Prop()
  created_date: number;

  @Prop()
  last_update: number;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);

QuestionSchema.index({
  content: 'text',
  description: 'text',
});
