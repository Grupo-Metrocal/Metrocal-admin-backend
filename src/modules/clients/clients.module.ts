import { Module } from '@nestjs/common'
import { ClientsService } from './clients.service'
import { ClientsController } from './clients.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Client } from './entities/client.entity'
import { Quote } from '../quotes/entities/quote.entity'
import { QuoteRequest } from '../quotes/entities/quote-request.entity'
import { EquipmentQuoteRequest } from '../quotes/entities/equipment-quote-request.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Client,
      Quote,
      QuoteRequest,
      EquipmentQuoteRequest,
    ]),
  ],
  controllers: [ClientsController],
  providers: [ClientsService],
  exports: [ClientsService],
})
export class ClientsModule {}
