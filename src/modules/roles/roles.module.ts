import { Module, forwardRef } from '@nestjs/common'
import { RolesService } from './roles.service'
import { RolesController } from './roles.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Role } from './entities/role.entity'
import { RolesInitializerService } from './roles.initializer.service'
import { User } from '../users/entities/user.entity'
import { UsersModule } from '../users/users.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Role, User]),
    forwardRef(() => UsersModule),
  ],
  controllers: [RolesController],
  providers: [RolesService, RolesInitializerService],
  exports: [RolesService],
})
export class RolesModule {}
