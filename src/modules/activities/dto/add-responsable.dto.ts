import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsPositive } from 'class-validator'

export class AddResponsableToActivityDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsPositive()
  activityId: number

  @ApiProperty()
  memberId: number
}
