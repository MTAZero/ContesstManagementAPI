import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class CategoryQuestion extends Document<any> {
  _id: Types.ObjectId;

  @Prop()
  name: string;

  @Prop()
  descriptions: string;

  @Prop()
  created_date: number;

  @Prop()
  last_update: number;
}

export const CategoryQuestionSchema = SchemaFactory.createForClass(CategoryQuestion);

CategoryQuestionSchema.index({
  name: 'text',
  description: 'text'
});
