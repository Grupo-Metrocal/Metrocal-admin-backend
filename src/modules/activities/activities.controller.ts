import { Controller } from '@nestjs/common'
import { ActivitiesService } from './activities.service'
import { ApiTags } from '@nestjs/swagger'
import { Get, Post, Body } from '@nestjs/common'
import { AssignTeamMembersToActivityDto } from './dto/assign-activity.dt'

@ApiTags('activities')
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get()
  async getAllActivities() {
    return await this.activitiesService.getAllActivities()
  }

  @Post('assign-members')
  async assignActivity(
    @Body() assignActivityDto: AssignTeamMembersToActivityDto,
  ) {
    return await this.activitiesService.assignTeamMembers(assignActivityDto)
  }
}
