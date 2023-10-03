import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, DataSource } from 'typeorm'
import { Quote } from './entities/quote.entity'
import { EquipmentQuoteRequest } from './entities/equipment-quote-request.entity'
import { QuoteRequest } from './entities/quote-request.entity'
import { QuoteRequestDto } from './dto/quote-request.dto'
import { ClientsService } from '../clients/clients.service'
import { updateEquipmentQuoteRequestDto } from './dto/update-equipment-quote-request.dto'
import { UpdateQuoteRequestDto } from './dto/update-quote-request.dto'

@Injectable()
export class QuotesService {
  constructor(
    @InjectRepository(Quote)
    private readonly quoteRepository: Repository<Quote>,
    @InjectRepository(QuoteRequest)
    private readonly quoteRequestRepository: Repository<QuoteRequest>,
    @InjectRepository(EquipmentQuoteRequest)
    private readonly equipmentQuoteRequestRepository: Repository<EquipmentQuoteRequest>,
    private readonly clientsService: ClientsService,
    private readonly dataSource: DataSource,
  ) {}

  async createQuoteRequest(quoteRequestDto: QuoteRequestDto) {
    const client = await this.clientsService.findById(quoteRequestDto.client_id)

    const quoteRequest = this.quoteRequestRepository.create({
      status: quoteRequestDto.status,
      client,
      general_discount: quoteRequestDto.general_discount,
      tax: quoteRequestDto.tax,
      price: quoteRequestDto.price,
    })

    const equipmentQuoteRequest = quoteRequestDto.equipment_quote_request.map(
      (equipmentQuoteRequest) => {
        const equipment = this.equipmentQuoteRequestRepository.create(
          equipmentQuoteRequest,
        )
        equipment.quote_request = quoteRequest
        return equipment
      },
    )

    quoteRequest.equipment_quote_request = equipmentQuoteRequest

    try {
      await this.dataSource.transaction(async (manager) => {
        await manager.save(quoteRequest)
        await manager.save(client)
        await manager.save(equipmentQuoteRequest)
      })
    } catch (error) {
      throw new Error(error)
    }
  }

  async getAllQuoteRequest() {
    return await this.quoteRequestRepository.find({
      where: [{ status: 'pending' }, { status: 'waiting' }, { status: 'done' }],
      relations: ['equipment_quote_request', 'client'],
    })
  }

  async getQuoteRequestByClientId(id: number) {
    return await this.quoteRequestRepository.find({
      where: { client: { id } },
      relations: ['equipment_quote_request', 'client'],
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
      relations: ['equipment_quote_request', 'client'],
    })
  }

  async updateEquipmentQuoteRequest(
    equipmentQuoteRequest: updateEquipmentQuoteRequestDto,
  ) {
    const equipment = await this.equipmentQuoteRequestRepository.findOne({
      where: { id: equipmentQuoteRequest.id },
    })

    if (!equipment) {
      throw new Error('El equipo no existe')
    }

    Object.assign(equipment, equipmentQuoteRequest)

    return await this.equipmentQuoteRequestRepository.save(equipment)
  }

  async updateStatusQuoteRequest(QuoteRequest: UpdateQuoteRequestDto) {
    const quoteRequest = await this.quoteRequestRepository.findOne({
      where: { id: QuoteRequest.id },
      select: [
        'id',
        'status',
        'tax',
        'price',
        'general_discount',
        'updated_at',
      ],
    })

    console.log(quoteRequest)

    if (!quoteRequest) {
      throw new Error('La cotización no existe')
    }

    Object.assign(quoteRequest, QuoteRequest)

    return await this.quoteRequestRepository.save(quoteRequest)
  }
}
