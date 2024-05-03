import {
  Controller,
  Delete,
  Param,
  ParseFilePipeBuilder,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { ActivitiesService } from './activities.service'
import { ApiTags } from '@nestjs/swagger'
import { Get, Post, Body } from '@nestjs/common'
import { AssignTeamMembersToActivityDto } from './dto/assign-activity.dt'
import { RemoveMemberFromActivityDto } from './dto/remove-member.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { AddResponsableToActivityDto } from './dto/add-responsable.dto'
import { FileInterceptor } from '@nestjs/platform-express'
import { FinishActivityDto } from './dto/finish-activity.dto'
import { ReviewActivityDto } from './dto/review-activty.dto'

@ApiTags('activities')
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllActivities() {
    return await this.activitiesService.getAllActivities()
  }

  // @UseGuards(JwtAuthGuard)
  @Get('done')
  async getActivitiesDoneToCertify() {
    return await this.activitiesService.getActivitiesDoneToCertify()
  }

  @UseGuards(JwtAuthGuard)
  @Post('generate/:id')
  async generateActivity(@Param('id') id: number) {
    return await this.activitiesService.generateActivity(id)
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async getActivityByID(@Param('id') id: number) {
    return await this.activitiesService.getActivityById(id)
  }

  @Get('user/:id')
  async getActivityById(@Param('id') id: number) {
    return await this.activitiesService.getActivitiesByUser(id)
  }

  @UseGuards(JwtAuthGuard)
  @Post('assign-members')
  async assignActivity(
    @Body() assignActivityDto: AssignTeamMembersToActivityDto,
  ) {
    return await this.activitiesService.assignTeamMembers(assignActivityDto)
  }

  @UseGuards(JwtAuthGuard)
  @Get('get-last-activities/:lastActivities')
  async getLastActivities(@Param('lastActivities') lastActivities: number) {
    return await this.activitiesService.getLastActivities(lastActivities)
  }

  @UseGuards(JwtAuthGuard)
  @Post('remove-member')
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

  @Get('get-services/:id')
  async getActivitiesByUser(@Param('id') id: number) {
    return await this.activitiesService.getServicesByActivity(id)
  }

  // @UseGuards(JwtAuthGuard)
  @Post('finished-activity/:id')
  async finishActivity(
    @Param('id') id: number,
    @Body() data: FinishActivityDto,
  ) {
    return await this.activitiesService.finishActivity(id, data)
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete/:id')
  async deleteActivity(@Param('id') id: number) {
    return await this.activitiesService.deleteActivity(id)
  }
  // @UseGuards(JwtAuthGuard)
  @Post('client-signature/:activityID')
  @UseInterceptors(FileInterceptor('image'))
  async clientSignature(
    @Param('activityID') id: number,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: 'image',
        })
        .build({
          fileIsRequired: false,
        }),
    )
    image: Express.Multer.File,
  ) {
    return await this.activitiesService.addClientSignature(id, image)
  }

  @Post('review-activity/:activityID')
  async reviewActivity(
    @Param('activityID') id: number,
    @Body() data: ReviewActivityDto,
  ) {
    return await this.activitiesService.reviewActivity(id, data.token)
  }
}
