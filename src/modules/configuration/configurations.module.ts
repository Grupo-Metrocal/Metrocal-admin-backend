import { Module, forwardRef } from '@nestjs/common'

import { TypeOrmModule } from '@nestjs/typeorm'
import { QuotesModule } from '../quotes/quotes.module'
import { Configuration } from './entities/configuration.entity'
import { ConfigurationService } from './configurations.service'
import { ConfigurationController } from './configurations.controller'

@Module({
  imports: [
    TypeOrmModule.forFeature([Configuration]),
    forwardRef(() => QuotesModule),
  ],
  controllers: [ConfigurationController],
  providers: [ConfigurationService],
  exports: [ConfigurationService],
})
export class ConfigurationModule {}