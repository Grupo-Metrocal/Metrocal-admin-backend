import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Activity } from './entities/activities.entity'
import { Repository, DataSource } from 'typeorm'

@Injectable()
export class ActivitiesService {
  constructor() // @InjectRepository(Activity)
  // private readonly activitiesRepository: Repository<Activity>,
  {}

  async addActivity(activity: Activity) {}
}
