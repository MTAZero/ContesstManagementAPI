import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { UserRolesEnum } from 'src/enums';

@Schema()
export class User extends Document<any> {
  _id: Types.ObjectId;

  @Prop()
  fullname: string;

  @Prop()
  username: string;

  @Prop()
  password: string;

  @Prop()
  role: UserRolesEnum;

  @Prop()
  created_date: number;

  @Prop()
  last_update: number;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({
  username: 'text',
  full_name: 'text',
  type: 'text',
});
