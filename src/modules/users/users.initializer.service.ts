import { Injectable, OnModuleInit } from '@nestjs/common'
import { UsersService } from './users.service'
@Injectable()
export class UsersInitializerService implements OnModuleInit {
  constructor(private readonly usersService: UsersService) {}

  async onModuleInit() {
    await this.usersService.createDefaultUsers()
  }
}
