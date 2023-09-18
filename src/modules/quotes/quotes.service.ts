import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Quote } from './entities/quote.entity'
import { EquipmentQuoteRequest } from './entities/equipment-quote-request.entity'
import { QuoteRequest } from './entities/quote-request.entity'
import { QuoteRequestDto } from './dto/quote-request.dto'

@Injectable()
export class QuotesService {
  constructor(
    @InjectRepository(Quote)
    private readonly quoteRepository: Repository<Quote>,
    @InjectRepository(QuoteRequest)
    private readonly quoteRequestRepository: Repository<QuoteRequest>,
    @InjectRepository(EquipmentQuoteRequest)
    private readonly equipmentQuoteRequestRepository: Repository<EquipmentQuoteRequest>,
  ) {}

  async createQuoteRequest(
    quoteRequestDto: QuoteRequestDto,
  ): Promise<QuoteRequest> {
    const equipmentQuoteRequest =
      await this.equipmentQuoteRequestRepository.save(
        quoteRequestDto.equipment_quote_request,
      )
    const quoteRequest = await this.quoteRequestRepository.save({
      ...quoteRequestDto,
      equipment_quote_request: equipmentQuoteRequest,
    })
    return quoteRequest
  }

  async getAllQuoteRequest() {
    return await this.quoteRequestRepository.find({
      where: [{ status: 'pending' }, { status: 'waiting' }, { status: 'done' }],
      relations: ['equipment_quote_request'],
    })
  }

  async rejectQuoteRequest(id: number) {
    const quoteRequest = await this.quoteRequestRepository.findOne({
      where: { id },
    })
    quoteRequest.status = 'rejected'
    return await this.quoteRequestRepository.save(quoteRequest)
  }

  async getQuoteRequestById(id: number) {
    return await this.quoteRequestRepository.findOne({
      where: { id },
      relations: ['equipment_quote_request'],
    })
  }
}
