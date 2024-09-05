import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsDate } from 'class-validator'
import { QuoteRequest } from '../entities/quote-request.entity'

export class UpdateQuoteRequestDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  id: number

  @ApiProperty()
  @IsNotEmpty()
  status: 'pending' | 'waiting' | 'done' | 'canceled' | 'rejected'

  @ApiProperty()
  @IsNumber()
  tax?: number

  @ApiProperty()
  price?: number

  @ApiProperty()
  extras?: number

  @ApiProperty()
  @IsNumber()
  general_discount?: number

  @ApiProperty()
  updated_at?: Date

  @ApiProperty()
  @IsNotEmpty()
  authorized_token: string

  @ApiProperty()
  rejected_comment?: string

  @ApiProperty()
  rejected_options?: string[]

  @ApiProperty()
  modifiedQuote: QuoteRequest
}
