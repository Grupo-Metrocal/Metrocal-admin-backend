import { forwardRef, Module } from '@nestjs/common'
import { ClientsService } from './clients.service'
import { ClientsController } from './clients.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Client } from './entities/client.entity'
import { QuoteRequest } from '../quotes/entities/quote-request.entity'
import { EquipmentQuoteRequest } from '../quotes/entities/equipment-quote-request.entity'
import { Activity } from '../activities/entities/activities.entity'
import { QuotesModule } from '../quotes/quotes.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Client,
      Activity,
      QuoteRequest,
      EquipmentQuoteRequest,
    ]),
    forwardRef(() => QuotesModule),
  ],
  controllers: [ClientsController],
  providers: [ClientsService],
  exports: [ClientsService],
})
export class ClientsModule {}
