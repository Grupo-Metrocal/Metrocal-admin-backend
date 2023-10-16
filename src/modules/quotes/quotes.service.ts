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
import { MailService } from '../mail/mail.service'
import { TokenService } from '../auth/jwt/jwt.service'
import { ApprovedQuoteRequestDto } from '../mail/dto/approved-quote-request.dto'
import { PdfService } from '../mail/pdf.service'
import { changeStatusQuoteRequestDto } from './dto/change-status-quote-request.dto'
import { AddQuoteDto } from './dto/quote.dto'

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
    private readonly mailService: MailService,
    private readonly tokenService: TokenService,
    private readonly pdfService: PdfService,
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
      relations: ['equipment_quote_request', 'client', 'quote', 'approved_by'],
    })
  }

  async getQuoteRequestByClientId(id: number) {
    return await this.quoteRequestRepository.find({
      where: { client: { id } },
      relations: ['equipment_quote_request', 'client', 'quote', 'approved_by'],
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
      relations: ['equipment_quote_request', 'client', 'quote', 'approved_by'],
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

    if (!quoteRequest) {
      throw new Error('La cotización no existe')
    }

    Object.assign(quoteRequest, QuoteRequest)
    const token = this.tokenService.generateTemporaryLink(
      quoteRequest.id,
      '15d',
    )

    let approvedQuoteRequestDto: ApprovedQuoteRequestDto

    if (quoteRequest.status === 'waiting') {
      const quote = await this.getQuoteRequestById(QuoteRequest.id)
      approvedQuoteRequestDto = new ApprovedQuoteRequestDto()
      approvedQuoteRequestDto.clientName = quote.client.company_name
      approvedQuoteRequestDto.servicesAndEquipments =
        quote.equipment_quote_request.map((equipment) => {
          return {
            service: equipment.type_service,
            equipment: equipment.name,
            count: equipment.count,
            unitPrice: equipment.price,
            subTotal: equipment.total,
            discount: equipment.discount,
          }
        })

      approvedQuoteRequestDto.total = QuoteRequest.price
      approvedQuoteRequestDto.token = token
      approvedQuoteRequestDto.email = quote.client.email
      approvedQuoteRequestDto.linkDetailQuote = `${process.env.DOMAIN}/quote/${token}`
      approvedQuoteRequestDto.subtotal = quote.equipment_quote_request.reduce(
        (acc, equipment) => acc + equipment.total,
        0,
      )
      approvedQuoteRequestDto.tax = QuoteRequest.tax
      approvedQuoteRequestDto.discount = QuoteRequest.general_discount
    }

    try {
      await this.quoteRequestRepository.save(quoteRequest)

      if (quoteRequest.status === 'waiting') {
        await this.mailService.sendMailApprovedQuoteRequest(
          approvedQuoteRequestDto,
        )
      }

      return quoteRequest
    } catch (error) {
      return false
    }
  }

  async getQuoteRequestByToken(token: string) {
    const { id } = this.tokenService.verifyTemporaryLink(token)

    if (!id) {
      return false
    }

    return await this.getQuoteRequestById(id)
  }

  async getQuoteRequestPdf(template: string, id: number) {
    const quote = await this.getQuoteRequestById(id)

    if (!quote) {
      throw new Error('La cotización no existe')
    }

    const data = {}

    data['servicesAndEquipments'] = quote.equipment_quote_request.map(
      (equipment) => {
        return {
          service: equipment.type_service,
          equipment: equipment.name,
          count: equipment.count,
          unitPrice: equipment.price,
          subTotal: equipment.total,
          discount: equipment.discount,
        }
      },
    )
    data['tax'] = quote.tax
    data['discount'] = quote.general_discount
    data['subtotal'] = quote.equipment_quote_request.reduce(
      (acc, equipment) => acc + equipment.total,
      0,
    )
    data['total'] = quote.price
    data['client'] = quote.client
    data['date'] = quote.created_at.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })

    return await this.pdfService.generatePdf(template, data)
  }

  async changeStatusQuoteRequest(
    changeStatusQuoteRequest: changeStatusQuoteRequestDto,
  ) {
    const quoteRequest = await this.quoteRequestRepository.findOne({
      where: { id: changeStatusQuoteRequest.id },
    })

    if (!quoteRequest) {
      throw new Error('La cotización no existe')
    }

    quoteRequest.status = changeStatusQuoteRequest.status

    try {
      await this.quoteRequestRepository.save(quoteRequest)
      return quoteRequest
    } catch (error) {
      return false
    }
  }

  async addQuote(addQuoteDto: AddQuoteDto) {
    const quoteRequest = await this.getQuoteRequestById(addQuoteDto.id)

    const quote = new Quote()

    quote.quote_request = quoteRequest
    quoteRequest.quote = quote

    try {
      await this.dataSource.transaction(async (manager) => {
        await manager.save(quoteRequest)
        await manager.save(quote)
      })
      return true
    } catch (error) {
      return false
    }
  }

  async getQuotes() {
    return await this.quoteRepository.find({
      relations: [
        'quote_request',
        'workers',
        'quote_request.client',
        'quote_request.equipment_quote_request',
        'quote_request.approved_by',
      ],
    })
  }

  async getQuoteRequestRegister() {
    return await this.quoteRequestRepository
      .createQueryBuilder('quote_request')
      .select([
        'quote_request.id AS id',
        'quote_request.status',
        'quote_request.price',
        'quote_request.created_at',
        `COALESCE(approved_by.username, 'Sin asignar') AS approved_by`,
        'client.company_name',
        'client.phone',
      ])
      .where('quote_request.status IN (:...statuses)', {
        statuses: ['done', 'rejected', 'canceled'],
      })
      .leftJoin('quote_request.approved_by', 'approved_by')
      .leftJoin('quote_request.client', 'client')
      .getRawMany()
  }

  async deleteQuoteRequest(id: number) {
    const quoteRequest = await this.quoteRequestRepository.findOne({
      where: { id },
      relations: ['equipment_quote_request', 'quote', 'client', 'approved_by'],
    })

    if (!quoteRequest) {
      throw new Error('La cotización no existe')
    }

    try {
      await this.quoteRequestRepository.delete({ id })
      return true
    } catch (error) {
      console.log(error)
      return false
    }
  }
}
