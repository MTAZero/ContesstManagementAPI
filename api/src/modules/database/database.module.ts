import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { User, UserSchema } from "./schemas/users.schema";
import { UserDBService } from "./services/userDBService";
import { appConfig } from "src/configs/configuration.config";
import { JwtModule } from "@nestjs/jwt";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
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
  providers: [UserDBService],
  exports: [UserDBService],
})
export class DatabaseModule {}
