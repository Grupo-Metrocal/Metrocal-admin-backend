import { IsString, IsNotEmpty, IsNumber } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateMethodDto {
  @ApiProperty()
  @IsNumber()
  activity_id: number
}
