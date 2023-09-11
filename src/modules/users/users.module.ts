import { Module } from '@nestjs/common'
import { UsersService } from './users.service'
import { UsersController } from './users.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from './entities/user.entity'
import { JwtStrategy } from '../auth/jwt.strategy'
import { MailService } from '../mail/mail.service'
import { ResetPassword } from './entities/reset-password.entity'

@Module({
  imports: [TypeOrmModule.forFeature([User, ResetPassword])],
  controllers: [UsersController],
  providers: [UsersService, JwtStrategy, MailService],
  exports: [UsersService],
})
export class UsersModule {}
