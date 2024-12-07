import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EContestStatus } from 'src/enums';
import { ContestsRepository } from '../database/repositories/contests.repository';

@Injectable()
export class ContestsCronService {
  private readonly logger = new Logger(ContestsCronService.name);

  constructor(private readonly contestsRepository: ContestsRepository) {}

  // Cron job chạy mỗi giờ tại phút 0
  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleContestStatusUpdate() {
    this.logger.log('Running contest status update job');

    // Lấy thời gian hiện tại
    const currentTime = new Date();

    // Cập nhật trạng thái các cuộc thi
    await this.contestsRepository.updateMany(
      { status: EContestStatus.CREATED, start_time: { $lte: currentTime } }, // Điều kiện: đã tạo nhưng đến thời gian bắt đầu
      { status: EContestStatus.IN_PROGRESS }, // Chuyển sang trạng thái Đang diễn ra
    );

    await this.contestsRepository.updateMany(
      { status: EContestStatus.IN_PROGRESS, end_time: { $lte: currentTime } }, // Điều kiện: đang diễn ra nhưng đã hết thời gian
      { status: EContestStatus.FINISHED }, // Chuyển sang trạng thái Đã kết thúc
    );

    this.logger.log('Contest status update job completed');
  }
}