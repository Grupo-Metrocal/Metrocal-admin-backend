import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber } from 'class-validator'
import { EquipmentQuoteRequestDto } from './equipment-quote-request.dto'

export class QuoteRequestDto {
  @ApiProperty()
  status?: 'pending' | 'waiting' | 'done' | 'canceled' | 'rejected'

  @ApiProperty()
  @IsNumber()
  client_id?: number

  @ApiProperty()
  client?: {}

  @ApiProperty({ type: [EquipmentQuoteRequestDto] })
  @IsNotEmpty()
  equipment_quote_request: EquipmentQuoteRequestDto[]

  @ApiProperty()
  @IsNumber()
  general_discount?: number

  @ApiProperty()
  @IsNumber()
  tax?: number

  @ApiProperty()
  price?: number

  @ApiProperty()
  no?: string

  @ApiProperty()
  rejected_comment?: string

  @ApiProperty()
  rejected_options?: string[]

  @ApiProperty()
  extras?: number

  @ApiProperty()
  alt_client_email?: string

  @ApiProperty()
  alt_client_requested_by?: string

  @ApiProperty()
  alt_client_phone?: string
}
