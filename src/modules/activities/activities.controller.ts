import { Controller } from '@nestjs/common'
import { ActivitiesService } from './activities.service'
import { ApiTags } from '@nestjs/swagger'
import { Get } from '@nestjs/common'

@ApiTags('activities')
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get()
  async getAllActivities() {
    return await this.activitiesService.getAllActivities()
  }
}
