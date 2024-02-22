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
import type { QuoteRequest } from '../quotes/entities/quote-request.entity'

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

      const teamMembers = response.team_members.map((member) => {
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

      const data = activities.map((activity) => {
        return {
          id: activity.id,
          client: activity.quote_request.client,
          progress: activity.progress,
          status: activity.status,
          no: activity.quote_request.no,
          services: activity.quote_request.equipment_quote_request.length,
          team_members: activity.team_members.map((member) => {
            return {
              id: member.id,
              username: member.username,
              imageURL: member.imageURL,
            }
          }),
          created_at: activity.created_at,
        }
      })

      return handleOK(data)
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

      const equipments = response.quote_request.equipment_quote_request
        .filter(
          (service) => service.type_service.toLowerCase() === 'calibracion',
        )
        .map((service) => ({
          id: service.id,
          name: service.name,
          status: service.status,
          type_service: service.type_service,
          count: service.count,
          price: service.price,
          total: service.total,
          method_id: service.method_id,
        }))

      const data = {
        activity_id: response.id,
        quote_request_id: response.quote_request.id,
        status: response.status,
        created_at: response.created_at,
        equipment_quote_request: equipments,
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

  async finishActivity(activityID: number) {
    const activity = await this.activityRepository.findOne({
      where: { id: activityID },
    })

    if (!activity) {
      return handleInternalServerError('Actividad no encontrada')
    }

    try {
      activity.status = 'done'

      await this.activityRepository.save(activity)

      return handleOK(activity)
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

      return handleOK(activity.data)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }
}
