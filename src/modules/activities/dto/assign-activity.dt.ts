import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsPositive, IsNumber } from 'class-validator'

export class AssignTeamMembersToActivityDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsPositive()
  activityId: number

  @ApiProperty()
  teamMembersID: number[]
}
