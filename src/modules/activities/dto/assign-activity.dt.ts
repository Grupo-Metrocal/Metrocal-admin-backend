import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsPositive, IsNumber } from 'class-validator'

export class AssignTeamMembersToActivityDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsPositive()
  activityId: number

  @ApiProperty()
  @IsPositive({ each: true })
  @IsNumber({}, { each: true })
  teamMembersID: number[]
}
