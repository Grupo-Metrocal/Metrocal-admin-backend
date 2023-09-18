import { Module } from '@nestjs/common'
import { QuotesService } from './quotes.service'
import { QuotesController } from './quotes.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ClientsService } from '../clients/clients.service'
import { Quote } from './entities/quote.entity'
import { QuoteRequest } from './entities/quote-request.entity'
import { EquipmentQuoteRequest } from './entities/equipment-quote-request.entity'
import { User } from '../users/entities/user.entity'
import { Client } from '../clients/entities/client.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Quote,
      QuoteRequest,
      EquipmentQuoteRequest,
      User,
      Client,
    ]),
  ],
  controllers: [QuotesController],
  providers: [QuotesService, ClientsService],
  exports: [QuotesService],
})
export class QuotesModule {}
