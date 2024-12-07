import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { EContestStatus } from 'src/enums';

@Schema()
export class Contest extends Document<any> {
  _id: Types.ObjectId;

  @Prop()
  name: string;

  @Prop({ default: EContestStatus.CREATED })
  status: EContestStatus;

  @Prop()
  description: string;

  // Thời gian bắt đầu
  @Prop()
  start_time: Date;

  // Thời gian kết thúc
  @Prop()
  end_time: Date;

  // Thời lượng cuộc thi (tính bằng phút)
  @Prop()
  duration: number;

  // Người tạo cuộc thi
  @Prop({ type: Types.ObjectId, ref: 'User' })
  user_created: Types.ObjectId;

  @Prop()
  created_date: number;

  @Prop()
  last_update: number;
}

export const ContestSchema = SchemaFactory.createForClass(Contest);

ContestSchema.index({
  name: 'text',
  description: 'text',
  status: 'text',
  duration: 'text'
});
  
// Middleware tự động tính toán `end_time` trước khi lưu
ContestSchema.pre('save', function (next) {
  if (this.start_time && this.duration) {
    this.end_time = new Date(this.start_time.getTime() + this.duration * 60000);
  }
  this.last_update = Date.now(); // Cập nhật thời gian chỉnh sửa cuối
  next();
});