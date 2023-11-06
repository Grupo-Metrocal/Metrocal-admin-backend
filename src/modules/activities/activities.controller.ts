import { Controller } from '@nestjs/common'
import { ActivitiesService } from './activities.service'
import { ApiTags } from '@nestjs/swagger'

@ApiTags('activities')
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}
}
