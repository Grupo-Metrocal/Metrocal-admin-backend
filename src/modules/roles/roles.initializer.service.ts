import { Injectable, OnModuleInit } from '@nestjs/common'
import { RolesService } from './roles.service'

@Injectable()
export class RolesInitializerService implements OnModuleInit {
  constructor(private readonly rolesService: RolesService) {}
  async onModuleInit() {
    await this.rolesService.createDefaultRoles()
  }
}
