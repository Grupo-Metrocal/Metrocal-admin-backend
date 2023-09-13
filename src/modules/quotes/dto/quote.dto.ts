import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, isNotEmpty } from 'class-validator'

export class CreateQuoteDto {
  @ApiProperty()
  id: number

  @ApiProperty()
  quote_requests_id: number[]
}
