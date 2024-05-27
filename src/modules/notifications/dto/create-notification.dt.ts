import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsBoolean } from 'class-validator'

export class CreateNotificationDto {
  @ApiProperty()
  @IsNotEmpty()
  title: string

  @ApiProperty()
  @IsNotEmpty()
  body: string

  @ApiProperty()
  @IsBoolean()
  read: boolean

  @ApiProperty()
  @IsNotEmpty()
  userId: number
}
