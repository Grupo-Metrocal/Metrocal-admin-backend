import { Module } from '@nestjs/common'
import { UsersService } from './users.service'
import { UsersController } from './users.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from './entities/user.entity'
import { JwtStrategy } from '../auth/jwt.strategy'
import { MailService } from '../mail/mail.service'
import { ResetPassword } from './entities/reset-password.entity'
import { Role } from '../roles/entities/role.entity'
import { RolesService } from '../roles/roles.service'
import { UsersInitializerService } from './users.initializer.service'
import { TokenService } from '../auth/jwt/jwt.service'

@Module({
  imports: [TypeOrmModule.forFeature([User, ResetPassword, Role])],
  controllers: [UsersController],
  providers: [
    UsersService,
    JwtStrategy,
    MailService,
    RolesService,
    UsersInitializerService,
    TokenService,
  ],
  exports: [UsersService],
})
export class UsersModule {}
