import { Injectable, OnModuleInit } from '@nestjs/common'
import { EnginesService } from './engines.service'

@Injectable()
export class EngineInitializerService implements OnModuleInit {
  constructor(private readonly enginesService: EnginesService) {}

  async onModuleInit() {
    await this.enginesService.createDefaultEngines()
  }
}
