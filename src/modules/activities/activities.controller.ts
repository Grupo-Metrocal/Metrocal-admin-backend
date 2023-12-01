import { Controller, Delete, Param, UseGuards } from '@nestjs/common'
import { ActivitiesService } from './activities.service'
import { ApiTags } from '@nestjs/swagger'
import { Get, Post, Body } from '@nestjs/common'
import { AssignTeamMembersToActivityDto } from './dto/assign-activity.dt'
import { RemoveMemberFromActivityDto } from './dto/remove-member.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { AddResponsableToActivityDto } from './dto/add-responsable.dto'

@ApiTags('activities')
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllActivities() {
    return await this.activitiesService.getAllActivities()
  }

  @UseGuards(JwtAuthGuard)
  @Post('assign-members')
  async assignActivity(
    @Body() assignActivityDto: AssignTeamMembersToActivityDto,
  ) {
    console.log(assignActivityDto)
    return await this.activitiesService.assignTeamMembers(assignActivityDto)
  }

  @UseGuards(JwtAuthGuard)
  @Get('get-last-activities/:lastActivities')
  async getLastActivities(@Param('lastActivities') lastActivities: number) {
    return await this.activitiesService.getLastActivities(lastActivities)
  }

  @UseGuards(JwtAuthGuard)
  @Delete('remove-member')
  async removeMemberFromActivity(
    @Body() removeMemberDto: RemoveMemberFromActivityDto,
  ) {
    return await this.activitiesService.removeMemberFromActivity(
      removeMemberDto,
    )
  }

  @UseGuards(JwtAuthGuard)
  @Post('assign-responsable')
  async addResponsableToActivity(
    @Body() addResponsableDto: AddResponsableToActivityDto,
  ) {
    return await this.activitiesService.assingResponsableToActivity(
      addResponsableDto,
    )
  }
}
