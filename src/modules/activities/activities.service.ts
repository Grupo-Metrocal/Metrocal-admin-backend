import { Injectable, Inject, forwardRef } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Activity } from './entities/activities.entity'
import { Repository, DataSource } from 'typeorm'
import { QuotesService } from '../quotes/quotes.service'
import { handleInternalServerError, handleOK } from 'src/common/handleHttp'

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
    @Inject(forwardRef(() => QuotesService))
    private readonly quotesService: QuotesService,
    private readonly dataSource: DataSource,
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
}
