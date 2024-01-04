import { Injectable, Inject, forwardRef } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Activity } from './entities/activities.entity'
import { Repository, DataSource } from 'typeorm'
import { QuotesService } from '../quotes/quotes.service'
import { handleInternalServerError, handleOK } from 'src/common/handleHttp'
import { User } from '../users/entities/user.entity'
import { AssignTeamMembersToActivityDto } from './dto/assign-activity.dt'
import { RemoveMemberFromActivityDto } from './dto/remove-member.dto'
import { AddResponsableToActivityDto } from './dto/add-responsable.dto'

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
    @Inject(forwardRef(() => QuotesService))
    private readonly quotesService: QuotesService,
    private readonly dataSource: DataSource,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createActivity(activity: Activity) {
    const { data: quoteRequest } = await this.quotesService.getQuoteRequestById(
      activity.id,
    )

    const newActivity = this.activityRepository.create({
      ...activity,
      quote_request: quoteRequest,
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
}
