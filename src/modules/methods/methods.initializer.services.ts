import { Injectable, OnModuleInit } from '@nestjs/common'
import { MethodsService } from './methods.service'

@Injectable()
export class MethodsInitializerService implements OnModuleInit {
  constructor(private readonly methodsService: MethodsService) {}
  async onModuleInit() {
    return await this.methodsService.createByDefaultGenericMethod()
  }
}
