import { Module } from "@nestjs/common";
import { ContestsController } from "./contests.controller";
import { DatabaseModule } from "../database/database.module";
import { ContestsCronService } from "./contest-cron.service";

@Module({
  imports: [DatabaseModule],
  controllers: [ContestsController],
  providers: [ContestsCronService],
})
export class ContestsModule {}
