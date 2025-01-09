import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ServiceOrder } from './entities/service-order.entity'
import { DataSource, Repository } from 'typeorm'
import { Activity } from './entities/activities.entity'
import {
  handleBadrequest,
  handleInternalServerError,
  handleOK,
} from 'src/common/handleHttp'
import { formatDate } from 'src/utils/formatDate'
import { ServiceOrderDto } from './dto/service-order.dto'
import { PdfService } from '../mail/pdf.service'
import { MailService } from '../mail/mail.service'

@Injectable()
export class ServiceOrderService {
  constructor(
    @InjectRepository(ServiceOrder)
    private readonly serviceOrderRepository: Repository<ServiceOrder>,
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
    private readonly dataSource: DataSource,
    private readonly pdfService: PdfService,
    private readonly mailService: MailService,
  ) {}

  async createServiceOrder(activityId: number, serviceOrder: ServiceOrderDto) {
    try {
      const activity = await this.activityRepository.findOne({
        where: { id: activityId },
        relations: [
          'quote_request',
          'quote_request.equipment_quote_request',
          'service_order',
        ],
      })

      if (!activity) {
        return handleBadrequest(new Error('La actividad no existe'))
      }

      const serviceOrderCreated = this.serviceOrderRepository.create({
        equipments_ids: serviceOrder.equipments,
        finish_date: new Date(),
        start_time: serviceOrder.start_time,
        end_time: serviceOrder.end_time,
      })

      await this.dataSource.transaction(async (manager) => {
        for (let equipment of activity.quote_request.equipment_quote_request) {
          if (serviceOrder.equipments.includes(equipment.id)) {
            equipment.isEmitedServicesOrder = true
            await manager.save(equipment)
          }
        }

        await manager.save(serviceOrderCreated)

        if (!activity.service_order) {
          activity.service_order = []
        }
        activity.service_order.push(serviceOrderCreated)

        await manager.save(activity)
      })

      return handleOK(serviceOrderCreated)
    } catch (e) {
      return handleInternalServerError(e.message)
    }
  }

  async generateServiceOrderPDF(activityId: number, serviceOrderId: number) {
    try {
      const activity = await this.activityRepository.findOne({
        where: { id: activityId },
        relations: [
          'quote_request',
          'quote_request.equipment_quote_request',
          'quote_request.client',
        ],
      })

      const serviceOrder = await this.serviceOrderRepository.findOne({
        where: { id: serviceOrderId },
      })

      const equipments = activity.quote_request.equipment_quote_request.filter(
        (equipment) =>
          serviceOrder.equipments_ids.includes(equipment.id) && equipment,
      )

      const servicesToNormalize = new Set([
        'Calibración',
        'Caracterización',
        'Calificación',
        'Mant. Preventivo',
        'Mant. Correctivo',
      ])

      const data = {
        clientName: activity.quote_request.client.company_name,
        endDate: formatDate(serviceOrder.finish_date.toString()),
        startTime: serviceOrder.start_time,
        endTime: serviceOrder.end_time,
        address: activity.quote_request.client.address,
        requestedBy: activity.quote_request.client.requested_by,
        phone: activity.quote_request.client.phone,
        client_signature: activity.client_signature,
        work_areas: activity.work_areas.join(', ') || '',
        comments_insitu1: activity?.comments_insitu?.[0] || '',
        comments_insitu2: activity?.comments_insitu?.[1] || '',
        equipments: equipments.map((equipment, index) => {
          const service = equipment.type_service
          const normalizedService =
            service && servicesToNormalize.has(service) ? service : 'Otro'

          return {
            name: equipment.name,
            count: equipment.count,
            review_comment: equipment.review_comment,
            index: index + 1,
            quoteNumber: activity.quote_request.no,
            status:
              equipment.status === 'rejected' ? 'No realizado' : 'Realizado',
            resolvedService: normalizedService,
          }
        }),
        resolved_services: equipments
          .map((equipment) => equipment.type_service)
          .filter((service) => service !== undefined)
          .map((service) =>
            servicesToNormalize.has(service) ? service : 'Otro',
          ),
      }

      const pdf = await this.pdfService.generteServiceOrderPdf(data)

      if (!pdf) {
        return handleBadrequest(new Error('No se pudo generar el pdf'))
      }

      return handleOK(pdf)
    } catch (e) {
      console.log({ e })
      return handleInternalServerError(e.message)
    }
  }

  async sendPdfServiceOrder(activityId: number, pdf: Buffer) {
    try {
      const activity = await this.activityRepository.findOne({
        where: { id: activityId },
        relations: ['quote_request', 'team_members', 'quote_request.client'],
      })

      const response = await this.mailService.sendServiceOrderMail({
        to:
          activity.quote_request.alt_client_email ||
          activity.quote_request.client.email,
        pdf,
        clientName: activity.quote_request.client.company_name,
        quoteNumber: activity.quote_request.no,
        startDate: formatDate(activity.created_at + ''),
        endDate: formatDate(activity.updated_at + ''),
        technicians: activity.team_members.map((member) => member.username),
      })

      return handleOK(response)
    } catch (e) {
      return handleInternalServerError(e.message)
    }
  }
}
