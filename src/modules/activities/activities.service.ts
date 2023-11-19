import { Injectable, Inject, forwardRef } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Activity } from './entities/activities.entity'
import { Repository, DataSource } from 'typeorm'
import { QuotesService } from '../quotes/quotes.service'
import { handleInternalServerError, handleOK } from 'src/common/handleHttp'
import { User } from '../users/entities/user.entity'
import { AssignTeamMembersToActivityDto } from './dto/assign-activity.dt'

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
    const quoteRequest = await this.quotesService.getQuoteRequestById(
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
    const response = await this.activityRepository.find({
      relations: [
        'quote_request',
        'quote_request.client',
        'quote_request.equipment_quote_request',
        'quote_request.approved_by',
        'team_members',
      ],
    })

    return handleOK(response)
  }

  async getActivitiesByID(id: number) {
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

    return handleOK(response)
  }

  async assignTeamMembers({
    activityId,
    teamMembersID,
  }: AssignTeamMembersToActivityDto) {
    const response = await this.getActivitiesByID(activityId)
    let unassignedActivityUsers = [] as number[]

    if (!response.success) {
      return handleInternalServerError('Actividad no encontrada')
    }

    const activity = response.data as Activity

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
}
