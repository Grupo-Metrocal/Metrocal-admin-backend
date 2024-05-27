import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsPositive } from 'class-validator'

export class RemoveMemberFromActivityDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsPositive()
  activityId: number

  @ApiProperty()
  memberId: number
}
