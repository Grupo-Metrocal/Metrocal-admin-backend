import { Inject, Injectable, forwardRef } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import {
  Repository,
  DataSource,
  In,
  IsNull,
  Not,
  MoreThanOrEqual,
  ILike,
} from 'typeorm'
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
  handlePaginateByPageNumber,
} from 'src/common/handleHttp'
import { generateQuoteRequestCode } from 'src/utils/codeGenerator'
import { User } from '../users/entities/user.entity'
import { UsersService } from '../users/users.service'
import { RejectedQuoteRequest } from '../mail/dto/rejected-quote-request.dto'
import { ActivitiesService } from '../activities/activities.service'
import { PaginationQueryDto } from './dto/pagination-query.dto'
import { formatPrice } from 'src/utils/formatPrices'
import { MethodsService } from '../methods/methods.service'
import { PaginationQueryDinamicDto } from './dto/pagination-dinamic.dto'
import { ReviewEquipmentDto } from './dto/review-equipment.dto'
import { formatDate } from 'src/utils/formatDate'
import { ModificationRequestDto } from './dto/modification-request.dto'

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
    @Inject(forwardRef(() => MethodsService))
    private readonly methodsService: MethodsService,
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

  async getAll({ filterActive = false }: { filterActive?: boolean }) {
    try {
      const quotes = await this.quoteRequestRepository.find({
        relations: [
          'equipment_quote_request',
          'client',
          'approved_by',
          'activity',
        ],
        where: {
          status: In(['pending', 'waiting', 'done']),
          activity: filterActive ? IsNull() : Not(IsNull()), // Si filterActive es true, buscamos activity null, de lo contrario, activity no es null
        },
      })

      return handleOK(quotes)
    } catch (error) {
      return handleInternalServerError(error.message)
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
    try {
      const response = await this.quoteRequestRepository.find({
        where: { client: { id } },
        relations: [
          'equipment_quote_request',
          'client',
          'approved_by',
          'activity',
        ],
      })

      return handleOK(response)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async rejectQuoteRequest(id: number) {
    const quoteRequest = await this.quoteRequestRepository.findOne({
      where: { id },
    })
    quoteRequest.status = 'rejected'
    return await this.quoteRequestRepository.save(quoteRequest)
  }

  async getQuoteRequestById(id: number) {
    try {
      const response = await this.quoteRequestRepository.findOne({
        where: { id },
        relations: [
          'equipment_quote_request',
          'client',
          'approved_by',
          'activity',
        ],
      })

      return handleOK(response)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
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
        const { data: quote } = await this.getQuoteRequestById(
          quoteRequestDto.id,
        )
        approvedQuoteRequestDto = new ApprovedQuoteRequestDto()
        approvedQuoteRequestDto.clientName = quote.client.company_name
        approvedQuoteRequestDto.servicesAndEquipments =
          quote.equipment_quote_request.map((equipment) => {
            return {
              service: equipment.type_service,
              equipment: equipment.name,
              count: equipment.count,
              unitPrice:
                equipment.status === 'done'
                  ? formatPrice(equipment.price)
                  : '---',
              subTotal:
                equipment.status === 'done'
                  ? formatPrice(equipment.total)
                  : 'No aprobado',
              discount:
                equipment.status === 'done' ? equipment.discount + '%' : '---',
            }
          })

        approvedQuoteRequestDto.total = formatPrice(quoteRequestDto.price)
        approvedQuoteRequestDto.token = token
        approvedQuoteRequestDto.email = quote.client.email
        approvedQuoteRequestDto.linkDetailQuote = `${process.env.DOMAIN}/quote/${token}`
        ;(approvedQuoteRequestDto.subtotal = formatPrice(
          quote?.equipment_quote_request
            ?.map((equipment: any) =>
              equipment.status === 'done' ? equipment.total : 0,
            )
            .reduce((a, b) => a + b, 0),
        )),
          (approvedQuoteRequestDto.tax = quoteRequestDto.tax)
        approvedQuoteRequestDto.discount = quoteRequestDto.general_discount
        approvedQuoteRequestDto.extras = formatPrice(quoteRequestDto.extras)
      }

      let rejectedquoterequest: RejectedQuoteRequest | undefined
      if (quoteRequest.status === 'rejected') {
        const { data: quote } = await this.getQuoteRequestById(
          quoteRequestDto.id,
        )

        rejectedquoterequest = new RejectedQuoteRequest()
        rejectedquoterequest.clientName = quote.client.company_name
        rejectedquoterequest.email = quote.client.email
        rejectedquoterequest.comment = quoteRequestDto.rejected_comment
        rejectedquoterequest.linkToNewQuote = `${process.env.DOMAIN}`

        quoteRequest.rejected_comment = quoteRequestDto.rejected_comment
      }
      if (quoteRequest.status === 'rejected' && rejectedquoterequest) {
        await this.mailService.sendMailrejectedQuoteRequest(
          rejectedquoterequest,
        )
      }

      await this.dataSource.transaction(async (manager) => {
        quoteRequest.quote_modification_status =
          quoteRequest.quote_modification_status === 'pending'
            ? 'done'
            : quoteRequest.quote_modification_status

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

  async getQuoteRequestPdf(id: number) {
    const { data: quote } = await this.getQuoteRequestById(id)

    if (!quote) {
      throw new Error('La cotización no existe')
    }

    const data = {}

    data['servicesAndEquipments'] = quote.equipment_quote_request.map(
      (equipment, index) => {
        return {
          index: index + 1,
          service: equipment.type_service,
          equipment: equipment.name,
          method: equipment.calibration_method || 'Sin asignar',
          count: equipment.count,
          unitPrice: formatPrice(equipment.price),
          subTotal: formatPrice(equipment.total),
          comment: equipment.additional_remarks || '',
          measuring_range: equipment.measuring_range || '',
        }
      },
    )
    data['tax'] = quote.tax
    data['discount'] =
      quote.general_discount > 0 ? quote.general_discount : 'N/A'
    data['subtotal'] = formatPrice(
      quote.equipment_quote_request.reduce(
        (acc, equipment) => acc + equipment.total,
        0,
      ),
    )
    data['total'] = formatPrice(quote.price)
    data['client'] = quote.client
    data['date'] = formatDate(quote.created_at)
    data['no'] = quote.no
    data['length'] = quote.equipment_quote_request.length

    return await this.pdfService.generateQuoteRequestPdf(data)
  }

  async approvedOrRejectedQuoteByClient(
    changeStatusQuoteRequest: ApprovedOrRejectedQuoteByClientDto,
  ) {
    const quoteRequest = await this.quoteRequestRepository.findOne({
      where: { id: changeStatusQuoteRequest.id },
      relations: ['equipment_quote_request', 'activity'],
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

    if (quoteRequest.quote_modification_status === 'pending') {
      return handleBadrequest(
        new Error(
          'La cotización tiene una solicitud de modificación pendiente',
        ),
      )
    }

    quoteRequest.status = changeStatusQuoteRequest.status
    quoteRequest.rejected_comment = changeStatusQuoteRequest.comment
    quoteRequest.rejected_options = changeStatusQuoteRequest.options

    try {
      await this.quoteRequestRepository.save(quoteRequest)

      if (quoteRequest.status === 'done') {
        // const activity = await this.activitiesService.createActivity(
        //   changeStatusQuoteRequest as any,
        // )

        // const response = await this.methodsService.createMethod({
        //   activity_id: activity.data.id,
        // })

        return handleOK('Cotización aprobada')
      }

      return handleOK('Cotización rechazada')
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  //pagination and filter by status and client name and company name.
  async getQuoteRequestRegister({
    limit,
    offset,
    status,
    no_quote,
  }: PaginationQueryDinamicDto) {
    const arrayStatus = status
      .toString()
      .split(',')
      .filter(
        (element) =>
          element.trim() !== '' && element !== undefined && element !== null,
      )

    let next_expired = ''
    let expired = ''

    arrayStatus.forEach((i) => {
      if (i === 'next_expired') {
        next_expired = 'next_expired'
      }
      if (i === 'expired') {
        expired = 'expired'
      }
    })

    const statusMap = arrayStatus.map((i) => {
      if (i === 'next_expired' || i === 'expired') {
        return 'waiting' // Asignar 'done' en lugar de 'next_expired' o 'expired'.
      }
      if (i === 'approved') {
        arrayStatus.push('done')
        return 'done'
      }
      return i // Mantener el valor original si no es 'next_expired' o 'expired' .
    })

    // Cambiar el estado 'done' por 'next_expired', 'expired'  según el tiempo transcurrido desde la creación.
    const updateQuoteStatus = (quote_registered) => {
      if (next_expired !== '' || expired !== '') {
        for (let i = 0; i < quote_registered.length; i++) {
          if (quote_registered[i].quote_request_status === 'waiting') {
            const dateNow = new Date()
            const date = new Date(quote_registered[i].quote_request_created_at)
            const diffTime = Math.abs(dateNow.getTime() - date.getTime())

            if (
              diffTime <= 23 * 24 * 60 * 60 * 1000 &&
              diffTime >= 22 * 24 * 60 * 60 * 1000
            ) {
              quote_registered[i].quote_request_status = 'next_expired'
            } else if (diffTime > 30 * 24 * 60 * 60 * 1000) {
              quote_registered[i].quote_request_status = 'expired'
            } else {
              // Si no cumple las condiciones, podemos excluirlo del resultado.
              quote_registered.splice(i, 1)
              i-- // Ajustamos el índice porque eliminamos un elemento.
            }
          }
        }
      }
    }

    /*
      Si la solicitud incluye todos los estados posibles y no se especifica un nombre de empresa,
      se obtienen todas las solicitudes de cotización, se actualiza el estado según el tiempo transcurrido
      y se retorna el resultado paginado.
    */
    if (status.length === 47 && no_quote === '') {
      const quote_registered = await this.quoteRequestRepository
        .createQueryBuilder('quote_request')
        .select([
          'quote_request.id AS id',
          'quote_request.status',
          'quote_request.price',
          'quote_request.created_at',
          'quote_request.no',
          `COALESCE(approved_by.username, 'Sin asignar') AS approved_by`,
          'client.company_name',
          'client.phone',
        ])
        .where('quote_request.status IN (:...status)', {
          status: statusMap,
        })
        .leftJoin('quote_request.approved_by', 'approved_by')
        .leftJoin('quote_request.client', 'client')
        .getRawMany()

      updateQuoteStatus(quote_registered)

      return handlePaginateByPageNumber(quote_registered, limit, offset)
    }

    /* 
      Si la solicitud incluye todos los estados posibles y se especifica un nombre de empresa,
      se obtienen las solicitudes de cotización filtradas por el nombre de empresa,
      se actualiza el estado según el tiempo transcurrido y se retorna el resultado paginado.
    */
    if (status.length === 47 && no_quote !== '') {
      const quote_registered = await this.quoteRequestRepository
        .createQueryBuilder('quote_request')
        .select([
          'quote_request.id AS id',
          'quote_request.status',
          'quote_request.price',
          'quote_request.created_at',
          'quote_request.no',
          `COALESCE(approved_by.username, 'Sin asignar') AS approved_by`,
          'client.company_name',
          'client.phone',
        ])
        .where('quote_request.no ILIKE :no', {
          no: `%${no_quote}%`,
        })
        .andWhere('quote_request.status IN (:...status)', {
          status: statusMap,
        })
        .leftJoin('quote_request.approved_by', 'approved_by')
        .leftJoin('quote_request.client', 'client')
        .getRawMany()

      updateQuoteStatus(quote_registered)

      return handlePaginateByPageNumber(quote_registered, limit, offset)
    }

    /*
      Si la solicitud tiene estados especificados y no se proporciona un nombre de empresa,
      se registran los estados, se obtienen las solicitudes de cotización según los estados,
      se actualiza el estado según el tiempo transcurrido y se retorna el resultado paginado.
    */
    if (status.length !== 0 && no_quote === '') {
      const quote_registered = await this.quoteRequestRepository
        .createQueryBuilder('quote_request')
        .select([
          'quote_request.id AS id',
          'quote_request.status',
          'quote_request.price',
          'quote_request.no',
          'quote_request.created_at',
          `COALESCE(approved_by.username, 'Sin asignar') AS approved_by`,
          'client.company_name',
          'client.phone',
        ])
        .where('quote_request.status IN (:...status)', {
          status: statusMap,
        })
        .leftJoin('quote_request.approved_by', 'approved_by')
        .leftJoin('quote_request.client', 'client')
        .getRawMany()

      updateQuoteStatus(quote_registered)

      return handlePaginateByPageNumber(
        quote_registered.filter((quote) =>
          arrayStatus.includes(quote.quote_request_status),
        ),
        limit,
        offset,
      )
    }

    /*
      Si la solicitud tiene estados especificados y se proporciona un nombre de empresa,
      se registran los estados, se obtienen las solicitudes de cotización según los estados y el nombre de empresa,
      se actualiza el estado según el tiempo transcurrido y se retorna el resultado paginado.
    */
    if (status.length !== 0 && no_quote !== '') {
      const quote_registered = await this.quoteRequestRepository
        .createQueryBuilder('quote_request')
        .select([
          'quote_request.id AS id',
          'quote_request.status',
          'quote_request.price',
          'quote_request.created_at',
          'quote_request.no',
          `COALESCE(approved_by.username, 'Sin asignar') AS approved_by`,
          'client.company_name',
          'client.phone',
        ])
        .where('quote_request.status IN (:...status)', {
          status: statusMap,
        })
        .andWhere('quote_request.no ILIKE :no', {
          no: `%${no_quote}%`,
        })
        .leftJoin('quote_request.approved_by', 'approved_by')
        .leftJoin('quote_request.client', 'client')
        .getRawMany()

      updateQuoteStatus(quote_registered)

      return handlePaginateByPageNumber(
        quote_registered.filter((quote) =>
          arrayStatus.includes(quote.quote_request_status),
        ),
        limit,
        offset,
      )
    }
  }

  async deleteQuoteRequest(id: number) {
    const quoteRequest = await this.quoteRequestRepository.findOne({
      where: { id },
      relations: [
        'equipment_quote_request',
        'client',
        'activity',
        'client.quote_requests',
      ],
    })

    if (!quoteRequest) {
      throw new Error('La cotización no existe')
    }

    try {
      await this.dataSource.transaction(async (manager) => {
        if (quoteRequest.activity) {
          await this.activitiesService.deleteActivity(quoteRequest.activity.id)
        }

        await this.clientsService.deleteQuoteFromClient(quoteRequest.id)

        await manager.remove(quoteRequest)
      })
      return handleOK(true)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async rememberQuoteRequest(id: number) {
    const { data: quoteRequest } = await this.getQuoteRequestById(id)

    if (!quoteRequest) {
      return handleBadrequest(new Error('La cotización no existe'))
    }

    const token = this.tokenService.generateTemporaryLink(id, '15d')

    try {
      const approvedQuoteRequestDto = new ApprovedQuoteRequestDto()

      approvedQuoteRequestDto.clientName = quoteRequest.client.company_name
      approvedQuoteRequestDto.servicesAndEquipments =
        quoteRequest.equipment_quote_request.map((equipment) => {
          return {
            service: equipment.type_service,
            equipment: equipment.name,
            count: equipment.count,
            unitPrice:
              equipment.status === 'done'
                ? formatPrice(equipment.price)
                : '---',
            subTotal:
              equipment.status === 'done'
                ? formatPrice(equipment.total)
                : 'No aprobado',
            discount:
              equipment.status === 'done' ? equipment.discount + '%' : '---',
          }
        })

      approvedQuoteRequestDto.total = formatPrice(quoteRequest.price)
      approvedQuoteRequestDto.token = token
      approvedQuoteRequestDto.email = quoteRequest.client.email
      approvedQuoteRequestDto.linkDetailQuote = `${process.env.DOMAIN}/quote/${token}`
      approvedQuoteRequestDto.subtotal = formatPrice(
        quoteRequest?.equipment_quote_request
          ?.map((equipment: any) =>
            equipment.status === 'done' ? equipment.total : 0,
          )
          .reduce((a, b) => a + b, 0),
      )
      approvedQuoteRequestDto.tax = quoteRequest.tax
      approvedQuoteRequestDto.discount = quoteRequest.general_discount
      approvedQuoteRequestDto.extras = formatPrice(quoteRequest.extras)

      await this.mailService.sendMailApprovedQuoteRequest(
        approvedQuoteRequestDto,
      )
      return handleOK(true)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async GetMonthlyQuoteRequests(lastMonths: number) {
    try {
      const quoteRequests = await this.quoteRequestRepository
        .createQueryBuilder('quote_request')
        .select([
          `DATE_TRUNC('month', quote_request.created_at) AS month`,
          `COUNT(quote_request.id) AS count`,
        ])
        .where(
          `quote_request.created_at > NOW() - INTERVAL '${lastMonths} month'`,
        )
        .andWhere(`quote_request.status = 'done'`)
        .groupBy(`month`)
        .orderBy(`month`)
        .getRawMany()

      return handleOK(quoteRequests)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async asyncMethodToEquipment({ methodID, equipmentID }) {
    try {
      const quoteRequests = await this.equipmentQuoteRequestRepository.findOne({
        where: { id: equipmentID },
      })

      if (!quoteRequests) {
        return handleBadrequest(new Error('El equipo no existe'))
      }

      quoteRequests.method_id = methodID

      const response =
        await this.equipmentQuoteRequestRepository.save(quoteRequests)

      return handleOK(response)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async getQuoteRequestByStatus(status: any) {
    try {
      const quotes = await this.quoteRequestRepository.find({
        where: { status: status },
        relations: ['equipment_quote_request', 'client', 'activity'],
      })

      const quotesWithoutActivity = quotes.filter(
        (quote) => quote.activity === null,
      )

      return handleOK(quotesWithoutActivity)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async asyncDeleteMethodToEquipment({ methodID }: { methodID: number }) {
    try {
      const quoteRequests = await this.equipmentQuoteRequestRepository.findOne({
        where: { method_id: methodID },
      })

      if (!quoteRequests) {
        return handleBadrequest(new Error('El equipo no existe'))
      }

      quoteRequests.method_id = null

      const response =
        await this.equipmentQuoteRequestRepository.save(quoteRequests)

      return handleOK(response)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async addOrRemvoQuantityToEquipment({
    quoteRequestID,
    equipmentID,
    actionType,
  }: {
    quoteRequestID: number
    actionType: 'add' | 'remove'
    equipmentID: number
  }) {
    try {
      const quoteRequest = await this.quoteRequestRepository.findOne({
        where: { id: quoteRequestID },
        relations: ['equipment_quote_request'],
      })

      const equipment = quoteRequest.equipment_quote_request.find(
        (equipment) => equipment.id === equipmentID,
      )

      if (actionType === 'add') {
        equipment.count += 1
      } else {
        if (equipment.count === 1) {
          return handleBadrequest(new Error('No se puede restar más'))
        }

        equipment.count -= 1
      }

      const response =
        await this.equipmentQuoteRequestRepository.save(equipment)

      await this.recalculateQuoteRequestPrice(quoteRequestID)

      return handleOK(response)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async recalculateQuoteRequestPrice(quoteRequestID: number) {
    try {
      const quoteRequest = await this.quoteRequestRepository.findOne({
        where: { id: quoteRequestID },
        relations: ['equipment_quote_request'],
      })

      let totalQuote = 0
      let SubTotalEquipment = 0

      await this.dataSource.transaction(async (manager) => {
        for (const equipment of quoteRequest.equipment_quote_request) {
          // subTotal to equipment
          equipment.total =
            equipment.count * equipment.price * (1 - equipment.discount / 100)

          SubTotalEquipment += equipment.total

          await manager.save(equipment)
        }

        totalQuote += quoteRequest.extras + SubTotalEquipment

        // discount to totalQuote
        totalQuote -= totalQuote * (quoteRequest.general_discount / 100)

        // tax to totalQuote
        totalQuote += totalQuote * (quoteRequest.tax / 100)

        quoteRequest.price = totalQuote

        await manager.save(quoteRequest)
      })

      return handleOK('ok')
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async reviewEquipment(id: number, review: ReviewEquipmentDto) {
    try {
      const equipment = await this.equipmentQuoteRequestRepository.findOne({
        where: { id },
      })

      if (!equipment) {
        return handleBadrequest(new Error('El equipo no existe'))
      }

      equipment.review_comment = review.review_comment
      equipment.review_status = 'reviewed'

      const response =
        await this.equipmentQuoteRequestRepository.save(equipment)

      return handleOK(response)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async getAllQuoteRequestByClientId(
    id: number,
    page: number,
    limit: number,
    filterNo?: string,
  ) {
    try {
      const quotes = await this.quoteRequestRepository.find({
        where: { client: { id }, no: ILike(`%${filterNo}%`) },
        relations: [
          'equipment_quote_request',
          'client',
          'activity',
          'approved_by',
        ],
        skip: (page - 1) * limit,
        take: limit,
        order: { created_at: 'DESC' },
      })

      const pageQuotes = quotes.map((quote) => {
        return {
          id: quote.id,
          total_price: quote.price,
          approved_by: quote?.approved_by?.username || 'Sin aprobación',
          no: quote.no,
          created_at: quote.created_at,
          status: quote.status,
          activity_id: quote.activity?.id,
        }
      })

      const totalRequest = await this.quoteRequestRepository.find({
        where: { client: { id } },
      })

      const totalInvoice = totalRequest.reduce(
        (acc, quote) => acc + quote.price,
        0,
      )

      const quoteRejected = totalRequest.filter(
        (quote) => quote.status === 'rejected',
      )

      const data = {
        totalInvoice,
        quoteRejected: quoteRejected.length,
        paginationDataQuotes: pageQuotes,
      }

      return handlePaginate(data, totalRequest.length, limit, page)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async getFluctuationStatistic() {
    try {
      const lastMonths = 5
      const dateLimit = new Date()
      dateLimit.setMonth(dateLimit.getMonth() - lastMonths)

      const quotes = await this.quoteRequestRepository.find({
        where: [
          {
            status: 'rejected',
            created_at: MoreThanOrEqual(dateLimit),
          },
          {
            status: 'done',
            created_at: MoreThanOrEqual(dateLimit),
          },
        ],
      })

      const monthlyRevenue = {}

      quotes.forEach((quote) => {
        const month = quote.created_at.getMonth() + 1
        const year = quote.created_at.getFullYear()
        const key = `${year}-${month}`

        if (!monthlyRevenue[key]) {
          monthlyRevenue[key] = {
            count: 0,
            totalRevenue: 0,
          }
        }

        monthlyRevenue[key].count += 1
        monthlyRevenue[key].totalRevenue += quote.price || 0
      })

      const results = Object.keys(monthlyRevenue).map((key) => {
        return {
          month: key,
          count: monthlyRevenue[key].count,
          totalRevenue: monthlyRevenue[key].totalRevenue,
        }
      })

      return handleOK(results)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async quoteModificationRequest({ id, message }: ModificationRequestDto) {
    try {
      const quoteRequest = await this.quoteRequestRepository.findOne({
        where: { id },
      })

      if (!quoteRequest) {
        return handleBadrequest(new Error('La cotización no existe'))
      }

      if (quoteRequest.quote_modification_status === 'pending') {
        return handleBadrequest(
          new Error(
            'Ya existe una solicitud de modificación pendiente, espere a que sea aprobada o rechazada',
          ),
        )
      }

      if (quoteRequest.status === 'done') {
        return handleBadrequest(
          new Error(
            'La cotización ya ha sido aprobada anteriormente, no se puede solicitar una modificación',
          ),
        )
      }

      if (quoteRequest.status === 'rejected') {
        return handleBadrequest(
          new Error(
            'La cotización ya ha sido rechazada anteriormente, no se puede solicitar una modificación',
          ),
        )
      }

      quoteRequest.quote_modification_message = message
      quoteRequest.quote_modification_status = 'pending'

      await this.quoteRequestRepository.save(quoteRequest)

      return handleOK('Solicitud de modificación enviada')
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }
}
