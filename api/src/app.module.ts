import { MiddlewareConsumer, Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "@nestjs/config";
import {
  appConfig,
  archiveConfig,
  databaseConfig,
} from "./configs/configuration.config";
import { MongooseModule } from "@nestjs/mongoose";
import { DatabaseModule } from "./modules/database/database.module";
import { AuthenticationModule } from "./modules/authentication/authentication.module";
import { UsersModule } from "./modules/users/users.module";
import { PaginationMiddleware, SortMiddleware } from "./middleware";
import { QuestionsModule } from "./modules/questions/questions.module";
import { CategoryQuestionsModule } from "./modules/category_questions/category-questions.module";
import { ContestsModule } from "./modules/contests/contests.module";
import { ScheduleModule } from "@nestjs/schedule";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [".env"],
      isGlobal: true,
      load: [databaseConfig, appConfig, archiveConfig],
    }),
    ScheduleModule.forRoot(), // Cấu hình 
    MongooseModule.forRoot(databaseConfig().uri),
    DatabaseModule,
    AuthenticationModule,
    UsersModule,
    CategoryQuestionsModule,
    QuestionsModule,
    ContestsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(PaginationMiddleware).forRoutes("/");
    consumer.apply(SortMiddleware).forRoutes("/");
  }
}
