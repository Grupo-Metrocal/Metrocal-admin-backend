import { Injectable, OnModuleInit } from '@nestjs/common'
import { ConfigurationService } from './configurations.service'

@Injectable()
export class ConfigurationInitializerService implements OnModuleInit {
  constructor(private readonly configurationService: ConfigurationService) {}
  async onModuleInit() {
    await this.configurationService.createDefaultData()
  }
}
