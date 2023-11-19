import { Inject, Injectable, forwardRef } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, DataSource } from 'typeorm'
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
import { ApprovedOrRejectedQuoteByClientDto } from './dto/change-status-quote-request.dto'
import {
  handleBadrequest,
  handleInternalServerError,
  handleOK,
  handlePaginate,
} from 'src/common/handleHttp'
import { generateQuoteRequestCode } from 'src/utils/codeGenerator'
import { User } from '../users/entities/user.entity'
import { UsersService } from '../users/users.service'
import { RejectedCuoteRequest } from '../mail/dto/rejected-quote-request.dto'
import { ActivitiesService } from '../activities/activities.service'
import { PaginationQueryDto } from './dto/pagination-query.dto'

@Injectable()
export class QuotesService {
  constructor(
    @InjectRepository(QuoteRequest)
    private readonly quoteRequestRepository: Repository<QuoteRequest>,
    @InjectRepository(EquipmentQuoteRequest)
    private readonly equipmentQuoteRequestRepository: Repository<EquipmentQuoteRequest>,
    @Inject(forwardRef(() => ActivitiesService))
    private readonly activitiesService: ActivitiesService,
    private readonly clientsService: ClientsService,
    private readonly dataSource: DataSource,
    private readonly mailService: MailService,
    private readonly tokenService: TokenService,
    private readonly pdfService: PdfService,
    private readonly usersService: UsersService,
  ) {}

  async createQuoteRequest(quoteRequestDto: QuoteRequestDto) {
    const client = await this.clientsService.findById(quoteRequestDto.client_id)

    if (client.status !== 200) {
      return handleBadrequest(new Error('El cliente no existe'))
    }

    const quoteRequest = this.quoteRequestRepository.create({
      status: quoteRequestDto.status,
      client: client.data,
      general_discount: quoteRequestDto.general_discount,
      tax: quoteRequestDto.tax,
      price: quoteRequestDto.price,
      rejected_comment: quoteRequestDto.rejected_comment,
      rejected_options: quoteRequestDto.rejected_options,
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
      const response = await this.dataSource.transaction(async (manager) => {
        await manager.save(quoteRequest)
        await manager.save(client.data)
        await manager.save(equipmentQuoteRequest)

        const no = generateQuoteRequestCode(quoteRequest.id)
        quoteRequest.no = no
        await manager.save(quoteRequest)
      })

      return handleOK(response)
    } catch (error) {
      return handleInternalServerError(error)
    }
  }

  async getAllQuoteRequest({ limit, offset }: PaginationQueryDto) {
    const quotes = await this.quoteRequestRepository.find({
      where: [{ status: 'pending' }, { status: 'waiting' }, { status: 'done' }],
      relations: [
        'equipment_quote_request',
        'client',
        'approved_by',
        'activity',
      ],
      // order: { created_at: 'DESC' },
      take: limit,
      skip: offset,
    })

    const total = await this.quoteRequestRepository.count({
      where: [{ status: 'pending' }, { status: 'waiting' }, { status: 'done' }],
    })

    return handlePaginate(quotes, total, limit, offset)
  }

  async getQuoteRequestByClientId(id: number) {
    return await this.quoteRequestRepository.find({
      where: { client: { id } },
      relations: [
        'equipment_quote_request',
        'client',
        'approved_by',
        'activity',
      ],
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
      relations: [
        'equipment_quote_request',
        'client',
        'approved_by',
        'activity',
      ],
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

    const response = await this.equipmentQuoteRequestRepository.save(equipment)
    return handleOK(response.id)
  }

  async updateStatusQuoteRequest(quoteRequestDto: UpdateQuoteRequestDto) {
    try {
      const quoteRequest = await this.quoteRequestRepository.findOne({
        where: { id: quoteRequestDto.id },
        relations: ['approved_by'],
      })

      if (!quoteRequest) {
        return handleBadrequest(new Error('La cotización no existe'))
      }

      const decodeToken = this.tokenService.decodeToken(
        quoteRequestDto.authorized_token,
      )
      const userResponse = await this.usersService.findById(
        Number(decodeToken.sub),
      )

      if (!userResponse.success) {
        return handleBadrequest(new Error('El usuario no existe'))
      }

      const user = userResponse.data as User

      const circularSafeQuoteRequest = JSON.stringify(
        quoteRequest,
        (key, value) => {
          if (key === 'approved_by') {
            return undefined // Evita la relación 'approved_by'
          }
          return value
        },
      )

      const parsedQuoteRequest = JSON.parse(circularSafeQuoteRequest)

      parsedQuoteRequest.approved_by = user
      user.quote_requests.push(parsedQuoteRequest)

      Object.assign(quoteRequest, quoteRequestDto)

      const token = this.tokenService.generateTemporaryLink(
        quoteRequest.id,
        '30d',
      )

      let approvedQuoteRequestDto: ApprovedQuoteRequestDto | undefined

      if (quoteRequest.status === 'waiting') {
        const quote = await this.getQuoteRequestById(quoteRequestDto.id)
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

        approvedQuoteRequestDto.total = quoteRequestDto.price
        approvedQuoteRequestDto.token = token
        approvedQuoteRequestDto.email = quote.client.email
        approvedQuoteRequestDto.linkDetailQuote = `${process.env.DOMAIN}/quote/${token}`
        approvedQuoteRequestDto.subtotal = quote.equipment_quote_request.reduce(
          (acc, equipment) => acc + equipment.total,
          0,
        )
        approvedQuoteRequestDto.tax = quoteRequestDto.tax
        approvedQuoteRequestDto.discount = quoteRequestDto.general_discount
      }

      let rejectedcuoterequest: RejectedCuoteRequest | undefined
      if (quoteRequest.status === 'rejected') {
        const quote = await this.getQuoteRequestById(quoteRequestDto.id)

        rejectedcuoterequest = new RejectedCuoteRequest()
        rejectedcuoterequest.clientName = quote.client.company_name
        rejectedcuoterequest.email = quote.client.email
        rejectedcuoterequest.linkToNewQuote = `${process.env.DOMAIN}/quote/request`
      }
      if (quoteRequest.status === 'rejected' && rejectedcuoterequest) {
        await this.mailService.sendMailrejectedQuoteRequest(
          rejectedcuoterequest,
        )
      }

      await this.dataSource.transaction(async (manager) => {
        await manager.save(quoteRequest)
        await manager.save(User, user)
      })

      if (quoteRequest.status === 'waiting' && approvedQuoteRequestDto) {
        await this.mailService.sendMailApprovedQuoteRequest(
          approvedQuoteRequestDto,
        )
      }

      return handleOK(quoteRequest)
    } catch (error) {
      return handleInternalServerError(error.message)
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

  async approvedOrRejectedQuoteByClient(
    changeStatusQuoteRequest: ApprovedOrRejectedQuoteByClientDto,
  ) {
    const quoteRequest = await this.quoteRequestRepository.findOne({
      where: { id: changeStatusQuoteRequest.id },
    })

    if (!quoteRequest) {
      return handleBadrequest(new Error('La cotización no existe'))
    }

    if (quoteRequest.status === 'done') {
      return handleBadrequest(
        new Error('La cotización ya ha sido aprobada anteriormente'),
      )
    }

    if (quoteRequest.status === 'rejected') {
      return handleBadrequest(
        new Error('La cotización ya ha sido rechazada anteriormente'),
      )
    }

    quoteRequest.status = changeStatusQuoteRequest.status
    quoteRequest.rejected_comment = changeStatusQuoteRequest.comment
    quoteRequest.rejected_options = changeStatusQuoteRequest.options

    try {
      await this.quoteRequestRepository.save(quoteRequest)

      if (quoteRequest.status === 'done') {
        await this.activitiesService.createActivity(
          changeStatusQuoteRequest as any,
        )
      }
      return handleOK('Se ha cambiado el estado de la cotización')
    } catch (error) {
      return handleInternalServerError(error.message)
    }
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

  async rememberQuoteRequest(id: number) {
    const quoteRequest = await this.getQuoteRequestById(id)

    if (!quoteRequest) {
      return handleBadrequest(new Error('La cotización no existe'))
    }

    const token = this.tokenService.generateTemporaryLink(id, '15d')

    const approvedQuoteRequestDto = new ApprovedQuoteRequestDto()

    approvedQuoteRequestDto.clientName = quoteRequest.client.company_name
    approvedQuoteRequestDto.servicesAndEquipments =
      quoteRequest.equipment_quote_request.map((equipment) => {
        return {
          service: equipment.type_service,
          equipment: equipment.name,
          count: equipment.count,
          unitPrice: equipment.price,
          subTotal: equipment.total,
          discount: equipment.discount,
        }
      })

    approvedQuoteRequestDto.total = quoteRequest.price
    approvedQuoteRequestDto.token = token
    approvedQuoteRequestDto.email = quoteRequest.client.email
    approvedQuoteRequestDto.linkDetailQuote = `${process.env.DOMAIN}/quote/${token}`
    approvedQuoteRequestDto.subtotal =
      quoteRequest.equipment_quote_request.reduce(
        (acc, equipment) => acc + equipment.total,
        0,
      )
    approvedQuoteRequestDto.tax = quoteRequest.tax
    approvedQuoteRequestDto.discount = quoteRequest.general_discount

    try {
      await this.mailService.sendMailApprovedQuoteRequest(
        approvedQuoteRequestDto,
      )
      return handleOK(true)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }
}
