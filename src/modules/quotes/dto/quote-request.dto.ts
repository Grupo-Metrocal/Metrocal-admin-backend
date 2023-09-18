import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber } from 'class-validator'
import { EquipmentQuoteRequestDto } from './equipment-quote-request.dto'

export class QuoteRequestDto {
  @ApiProperty()
  status?: 'pending' | 'waiting' | 'done'

  @ApiProperty()
  @IsNotEmpty()
  equipment_quote_request: EquipmentQuoteRequestDto

  @ApiProperty()
  @IsNumber()
  general_discount: number

  @ApiProperty()
  @IsNumber()
  tax: number

  @ApiProperty()
  @IsNumber()
  price: number
}
