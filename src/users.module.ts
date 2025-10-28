import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { AuthModule } from './auth/auth.module';
import { User, UserSchema } from './auth/schemas/user.schema';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersController],
  providers: [],
  exports: [MongooseModule],
})
export class UsersModule {}
