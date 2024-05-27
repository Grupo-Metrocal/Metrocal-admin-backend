import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

export class NotificationDto {
  @ApiProperty()
  @IsNotEmpty()
  title: string

  @ApiProperty()
  @IsNotEmpty()
  body: string

  @ApiProperty()
  @IsNotEmpty()
  token: string
}
