import { Module } from '@nestjs/common'
import { QuotesService } from './quotes.service'
import { QuotesController } from './quotes.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Quote } from './entities/quote.entity'
import { QuoteRequest } from './entities/quote-request.entity'
import { EquipmentQuoteRequest } from './entities/equipment-quote-request.entity'
import { User } from '../users/entities/user.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Quote,
      QuoteRequest,
      EquipmentQuoteRequest,
      User,
    ]),
  ],
  controllers: [QuotesController],
  providers: [QuotesService],
  exports: [QuotesService],
})
export class QuotesModule {}
