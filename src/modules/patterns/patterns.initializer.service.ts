import { Injectable, OnModuleInit } from '@nestjs/common'
import { PatternsService } from './patterns.service'

@Injectable()
export class PatternsInitializerService implements OnModuleInit {
  constructor(private readonly patternService: PatternsService) {}

  async onModuleInit() {
    // await this.patternService.createDefaultPatterns()
  }
}
