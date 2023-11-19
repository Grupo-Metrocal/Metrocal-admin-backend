import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber } from 'class-validator'

export class ApprovedOrRejectedQuoteByClientDto {
  @ApiProperty()
  @IsNumber()
  id: number

  @ApiProperty()
  @IsNotEmpty()
  status: 'done' | 'rejected' | 'pending' | 'waiting' | 'canceled'

  @ApiProperty()
  comment?: string

  @ApiProperty()
  options?: string[]
}
