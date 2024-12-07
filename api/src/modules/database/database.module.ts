import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { User, UserSchema } from "./schemas/users.schema";
import { CategoryQuestion, CategoryQuestionSchema } from "./schemas/category_questions.schema";
import { Contest, ContestSchema } from "./schemas/contests.schema";
import { Question, QuestionSchema } from "./schemas/questions.schema";
import { QuestionContest, QuestionContestSchema } from "./schemas/question_contest.schema";
import { UserContest, UserContestSchema } from "./schemas/user_contest.schema";

import { UserRepository } from "./repositories/users.repository";

import { JwtModule } from "@nestjs/jwt";
import { appConfig } from "src/configs/configuration.config";
import { UserChoice, UserChoiceSchema } from "./schemas/user_choices.schema";
import { CategoryQuestionsRepository } from "./repositories/category_questions.repository";
import { ContestsRepository } from "./repositories/contests.repository";
import { QuestionsRepository } from "./repositories/questions.respository";
import { QuestionContestsRepository } from "./repositories/question_contests.repository";
import { UserChoicesRepository } from "./repositories/user_choices.repository";
import { UserContestRepository } from "./repositories/user_contest.repository";

@Module({
  imports: [
    // Đăng ký tất cả các schema với Mongoose
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: CategoryQuestion.name, schema: CategoryQuestionSchema },
      { name: Contest.name, schema: ContestSchema },
      { name: Question.name, schema: QuestionSchema },
      { name: QuestionContest.name, schema: QuestionContestSchema },
      { name: UserChoice.name, schema: UserChoiceSchema },
      { name: UserContest.name, schema: UserContestSchema },
    ]),
    JwtModule.registerAsync({
      useFactory: async () => ({
        secret: (await appConfig()).jwt_key,
        signOptions: {
          expiresIn: "10d",
        },
      }),
    }),
  ],
  providers: [
    UserRepository,
    CategoryQuestionsRepository,
    ContestsRepository,
    QuestionsRepository,
    QuestionContestsRepository,
    UserChoicesRepository,
    UserContestRepository,
  ],
  exports: [
    UserRepository,
    CategoryQuestionsRepository,
    ContestsRepository,
    QuestionsRepository,
    QuestionContestsRepository,
    UserChoicesRepository,
    UserContestRepository,
  ],
})
export class DatabaseModule {}