import { Injectable, Inject, forwardRef } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Activity } from './entities/activities.entity'
import { Repository, DataSource } from 'typeorm'
import { QuotesService } from '../quotes/quotes.service'
import {
  handleBadrequest,
  handleInternalServerError,
  handleOK,
} from 'src/common/handleHttp'
import { User } from '../users/entities/user.entity'
import { AssignTeamMembersToActivityDto } from './dto/assign-activity.dt'
import { RemoveMemberFromActivityDto } from './dto/remove-member.dto'
import { AddResponsableToActivityDto } from './dto/add-responsable.dto'
import { MethodsService } from '../methods/methods.service'
import { QuoteRequest } from '../quotes/entities/quote-request.entity'
import { PdfService } from '../mail/pdf.service'
import { MailService } from '../mail/mail.service'
import * as admin from 'firebase-admin'
import { formatDate } from 'src/utils/formatDate'
import { FinishActivityDto } from './dto/finish-activity.dto'
import { TokenService } from '../auth/jwt/jwt.service'

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
    @Inject(forwardRef(() => QuotesService))
    private readonly quotesService: QuotesService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
    @Inject(forwardRef(() => MethodsService))
    private readonly methodsService: MethodsService,
    private readonly pdfService: PdfService,
    private readonly mailService: MailService,
    private readonly tokenService: TokenService,
  ) {}

  async createActivity(activity: Activity) {
    const { data: quoteRequest } = await this.quotesService.getQuoteRequestById(
      activity.id,
    )

    const newActivity = this.activityRepository.create({
      ...activity,
      quote_request: quoteRequest,
      status: 'pending',
    })

    quoteRequest.activity = newActivity

    try {
      await this.dataSource.transaction(async (manager) => {
        await manager.save(newActivity)
        await manager.save(quoteRequest)
      })

      return handleOK(newActivity)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async getAllActivities() {
    try {
      const response = await this.activityRepository.find({
        relations: [
          'quote_request',
          'quote_request.client',
          'quote_request.equipment_quote_request',
          'quote_request.approved_by',
          'team_members',
        ],
      })

      const data = response.map((activity) => {
        const teamMembers = activity.team_members.map((member) => {
          return {
            id: member.id,
            username: member.username,
            email: member.email,
            imageURL: member.imageURL,
          }
        })

        return {
          ...activity,
          team_members: teamMembers,
        }
      })

      return handleOK(data)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async getActivityById(id: number) {
    try {
      const response = await this.activityRepository.findOne({
        where: { id },
        relations: [
          'quote_request',
          'quote_request.client',
          'quote_request.equipment_quote_request',
          'quote_request.approved_by',
          'team_members',
        ],
      })

      const teamMembers = response.team_members.map((member) => {
        return {
          id: member.id,
          username: member.username,
          email: member.email,
          imageURL: member.imageURL,
        }
      })

      const data = {
        ...response,
        team_members: teamMembers,
      }

      return handleOK(data)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async getActivitiesByID(id: number) {
    try {
      const response = await this.activityRepository.findOne({
        where: { id },
        relations: [
          'quote_request',
          'quote_request.client',
          'team_members',
          'quote_request.equipment_quote_request',
        ],
      })

      const teamMembers = response?.team_members?.map((member) => {
        return {
          id: member.id,
          username: member.username,
          email: member.email,
        }
      })

      const data = {
        ...response,
        team_members: teamMembers,
      }

      return handleOK(data)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async assignTeamMembers({
    activityId,
    teamMembersID,
  }: AssignTeamMembersToActivityDto) {
    const activity = await this.activityRepository.findOne({
      where: { id: activityId },
      relations: ['team_members'],
    })

    let unassignedActivityUsers = [] as number[]

    if (!activity) {
      return handleInternalServerError('Actividad no encontrada')
    }

    try {
      for (const member of teamMembersID) {
        const user = await this.userRepository.findOne({
          where: { id: member },
          relations: ['activities'],
        })

        if (!user) {
          unassignedActivityUsers.push(member)
          continue
        }

        activity.team_members = [...activity.team_members, user]
        user.activities = [...user.activities, activity]

        await this.dataSource.transaction(async (manager) => {
          await manager.save(activity)
          await manager.save(user)
        })
      }

      return handleOK(unassignedActivityUsers)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async getLastActivities(lastActivities: number) {
    try {
      const response = await this.activityRepository
        .createQueryBuilder('activities')
        .select([
          'activities.id AS id',
          'activities.created_at AS created_at',
          'approved_by.username AS approved_by',
          'client.company_name AS company_name',
          'quote_request.price AS price',
        ])
        // .where(`activities.status = 'done'`)
        .innerJoin('activities.quote_request', 'quote_request')
        .innerJoin('quote_request.approved_by', 'approved_by')
        .innerJoin('quote_request.client', 'client')
        .orderBy('activities.created_at', 'DESC')
        .limit(lastActivities)
        .getRawMany()

      return handleOK(response)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async removeMemberFromActivity({
    activityId,
    memberId,
  }: RemoveMemberFromActivityDto) {
    const activity = await this.activityRepository.findOne({
      where: { id: activityId },
      relations: ['team_members'],
    })

    if (!activity) {
      return handleInternalServerError('Actividad no encontrada')
    }

    if (activity.responsable === memberId) {
      return handleInternalServerError(
        'No puedes eliminar al responsable de la actividad',
      )
    }

    try {
      activity.team_members = activity.team_members.filter(
        (member) => member.id !== memberId,
      )

      await this.activityRepository.save(activity)

      const teamMembers = activity.team_members.map((member) => {
        return {
          id: member.id,
          username: member.username,
          email: member.email,
        }
      })

      return handleOK(teamMembers)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async assingResponsableToActivity(responsable: AddResponsableToActivityDto) {
    const activity = await this.activityRepository.findOne({
      where: { id: responsable.activityId },
    })

    if (!activity) {
      return handleInternalServerError('Actividad no encontrada')
    }

    try {
      activity.responsable = responsable.memberId

      await this.activityRepository.save(activity)

      return handleOK(activity)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async getActivitiesByUser(userID: number) {
    try {
      const activities = await this.activityRepository
        .createQueryBuilder('activities')
        .innerJoinAndSelect('activities.team_members', 'team_members')
        .leftJoinAndSelect('activities.quote_request', 'quote_request')
        .leftJoinAndSelect('quote_request.client', 'client')
        .leftJoinAndSelect(
          'quote_request.equipment_quote_request',
          'equipment_quote_request',
        )
        .where(`team_members.id = ${userID}`)
        .orderBy('activities.created_at', 'DESC')
        .getMany()

      const data = []
      for (const activity of activities) {
        const members = await this.getTeamMembersByActivity(activity.id)
        const activityData = {
          id: activity.id,
          quote_request_id: activity.quote_request.id,
          responsable: activity.responsable,
          client: activity.quote_request.client,
          progress: activity.progress,
          status: activity.status,
          no: activity.quote_request.no,
          services: activity.quote_request.equipment_quote_request.length,
          team_members: members.data,
          created_at: activity.created_at,
          client_signature: activity.client_signature,
        }
        data.push(activityData)
      }

      return handleOK(data)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async getTeamMembersByActivity(activityID: number) {
    try {
      const activity = await this.activityRepository.findOne({
        where: { id: activityID },
        relations: ['team_members'],
      })

      if (!activity) {
        return handleInternalServerError('Actividad no encontrada')
      }

      const teamMembers = activity.team_members.map((member) => {
        return {
          id: member.id,
          username: member.username,
          email: member.email,
          imageURL: member.imageURL,
        }
      })

      return handleOK(teamMembers)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async getServicesByActivity(activityID: number) {
    try {
      const response = await this.activityRepository
        .createQueryBuilder('activities')
        .innerJoinAndSelect('activities.quote_request', 'quote_request')
        .innerJoinAndSelect(
          'quote_request.equipment_quote_request',
          'equipment_quote_request',
        )
        .where(`activities.id = ${activityID}`)
        .getOne()

      const data = {
        activity_id: response.id,
        quote_request_id: response.quote_request.id,
        status: response.status,
        created_at: response.created_at,
        equipment_quote_request: response.quote_request.equipment_quote_request,
        comments_insitu: response.comments_insitu,
        work_areas: response.work_areas,
      }
      return handleOK(data)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async updateProgress(activityID: number) {
    const activity = await this.activityRepository.findOne({
      where: { id: activityID },
      relations: ['quote_request', 'quote_request.equipment_quote_request'],
    })

    if (!activity) {
      return handleInternalServerError('Actividad no encontrada')
    }

    const { equipment_quote_request } = activity.quote_request

    const servicesDone = equipment_quote_request.filter(
      (service) => service.review_status === 'done',
    )

    const progress =
      (servicesDone.length / equipment_quote_request.length) * 100

    try {
      activity.progress = progress

      await this.activityRepository.save(activity)

      return handleOK(activity)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async finishActivity(activityID: number, data: FinishActivityDto) {
    const activity = await this.activityRepository.findOne({
      where: { id: activityID },
    })

    if (!activity) {
      return handleInternalServerError('Actividad no encontrada')
    }

    try {
      activity.status = 'done'
      activity.updated_at = new Date()
      activity.progress = 100
      activity.work_areas = data.work_areas
      activity.comments_insitu = data.comments_insitu

      await this.activityRepository.save(activity)

      return await this.generateServiceOrder(activity.id)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async generateServiceOrder(activityID: number) {
    try {
      const activity = await this.activityRepository.findOne({
        where: { id: activityID },
        relations: [
          'quote_request',
          'quote_request.equipment_quote_request',
          'quote_request.client',
          'team_members',
        ],
      })

      const data = {
        clientName: activity.quote_request.client.company_name,
        endDate: formatDate(activity.updated_at + ''),
        address: activity.quote_request.client.address,
        requestedBy: activity.quote_request.client.requested_by,
        phone: activity.quote_request.client.phone,
        client_signature: activity.client_signature,
        work_areas: activity.work_areas.join(', ') || '',
        comments_insitu1: activity?.comments_insitu?.[0] || '',
        comments_insitu2: activity?.comments_insitu?.[1] || '',
        equipments: activity.quote_request.equipment_quote_request.map(
          (equipment, index) => {
            return {
              name: equipment.name,
              count: equipment.count,
              review_comment: equipment.review_comment,
              index: index + 1,
              quoteNumber: activity.quote_request.no,
            }
          },
        ),
      }

      const pdf = await this.pdfService.generatePdf('service_order.hbs', data)

      if (!pdf) {
        return handleBadrequest(new Error('No se pudo generar el pdf'))
      }

      const response = await this.mailService.sendServiceOrderMail({
        to: activity.quote_request.client.email.split(',')[0],
        pdf,
        clientName: activity.quote_request.client.company_name,
        quoteNumber: activity.quote_request.no,
        startDate: formatDate(activity.created_at + ''),
        endDate: formatDate(activity.updated_at + ''),
        technicians: activity.team_members.map((member) => member.username),
      })

      return handleOK(response)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async generateActivity(id: number) {
    try {
      const response = await this.quotesService.getQuoteRequestById(id)

      if (!response.success) {
        return handleBadrequest(new Error(response.details))
      }

      if (response.data.status !== 'done') {
        return handleBadrequest(
          new Error('La cotizacion aun no ha sido aprobada'),
        )
      }

      const { data: quoteRequest } = response as { data: QuoteRequest }

      if (quoteRequest.activity) {
        return handleBadrequest(
          new Error('La cotizacion ya tiene una actividad asociada'),
        )
      }

      const activity = await this.createActivity(quoteRequest as any)

      if (!activity.success) {
        return handleInternalServerError(activity.details)
      }

      const method = await this.methodsService.createMethod({
        activity_id: activity.data.id,
      })

      if (!method.success) {
        return handleInternalServerError(method.details)
      }

      const responseActivity = await this.getActivityById(activity.data.id)

      return handleOK(responseActivity.data)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async deleteActivity(id: number) {
    try {
      const activity = await this.activityRepository.findOne({
        where: { id },
        relations: ['quote_request', 'quote_request.equipment_quote_request'],
      })

      if (!activity) {
        return handleBadrequest(new Error('Actividad no encontrada'))
      }

      for (const equipment of activity.quote_request.equipment_quote_request) {
        await this.methodsService.deleteStackMethods(equipment.method_id)
      }

      await this.dataSource.transaction(async (manager) => {
        activity.quote_request.activity = null
        await manager.save(activity.quote_request)

        await manager.remove(activity)
      })

      return handleOK('Actividad eliminada')
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async updateActivityProgress(activityID: number) {
    try {
      const activity = await this.activityRepository.findOne({
        where: { id: activityID },
        relations: ['quote_request', 'quote_request.equipment_quote_request'],
      })

      if (!activity) {
        return handleInternalServerError('Actividad no encontrada')
      }

      const { equipment_quote_request } = activity.quote_request

      let progress = 0
      let totalServices = 0

      totalServices = equipment_quote_request
        .map((service) => {
          return service.count
        })
        .reduce((acc, curr) => acc + curr, 0)

      for (const equipment of equipment_quote_request) {
        const stack = await this.methodsService.getMethodsID(
          equipment.method_id,
        )

        if (!stack.success) {
          continue
        }

        const { data: methods } = stack as { data: any }

        methods.forEach((method: any) => {
          if (method.status === 'done') {
            progress += 1
          }
        })
      }

      progress = (progress / totalServices) * 100

      activity.progress = Number(progress.toFixed(0))

      await this.activityRepository.save(activity)

      return handleOK(activity)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async getActivitiesDoneToCertify() {
    try {
      const response = await this.activityRepository.find({
        where: { status: 'done', reviewed: true },
        relations: [
          'quote_request',
          'quote_request.equipment_quote_request',
          'quote_request.client',
          'team_members',
        ],
      })

      const data = response.map((activity) => {
        return {
          id: activity.id,
          created_at: activity.created_at,
          updated_at: activity.updated_at,
          responsable: activity.responsable,
          progress: activity.progress,
          quoteRequest: {
            id: activity.quote_request.id,
            no: activity.quote_request.no,
            price: activity.quote_request.price,
            client: {
              id: activity.quote_request.client.id,
              company_name: activity.quote_request.client.company_name,
              email: activity.quote_request.client.email,
            },
            equipment_quote_request:
              activity.quote_request.equipment_quote_request.map((service) => {
                return {
                  id: service.id,
                  name: service.name,
                  count: service.count,
                  type_service: service.type_service,
                  calibration_method: service.calibration_method,
                  total: service.total,
                  price: service.price,
                  method_id: service.method_id,
                }
              }),
          },
          team_members: activity.team_members.map((member) => {
            return {
              id: member.id,
              username: member.username,
              imageURL: member.imageURL,
            }
          }),
        }
      })

      return handleOK(data)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async addClientSignature(activityID: number, imageURL: string) {
    try {
      const activity = await this.activityRepository.findOne({
        where: { id: activityID },
      })

      if (!activity) {
        return handleBadrequest(new Error('Actividad no encontrada'))
      }

      activity.client_signature = imageURL

      await this.activityRepository.save(activity)

      return handleOK(activity)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async reviewActivity(activityID: number, token: string) {
    try {
      const { sub: id } = this.tokenService.decodeToken(token)

      const user = await this.userRepository.findOneBy({ id: +id })

      if (!user) {
        return handleBadrequest(new Error('Perfil no encontrado'))
      }

      const activity = await this.activityRepository.findOne({
        where: { id: activityID },
      })

      if (!activity) {
        return handleBadrequest(new Error('Actividad no encontrada'))
      }

      if (activity.status !== 'done') {
        return handleBadrequest(
          new Error('La actividad no ha sido finalizada por el responsable'),
        )
      }

      activity.reviewed = true
      activity.reviewed_user_id = user.id

      await this.activityRepository.save(activity)

      return handleOK(activity)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }
}
