import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber } from 'class-validator'

export class changeStatusQuoteRequestDto {
  @ApiProperty()
  @IsNumber()
  id: number

  @ApiProperty()
  @IsNotEmpty()
  status: 'done' | 'rejected' | 'pending' | 'waiting' | 'canceled'
}
