import { ApiProperty } from '@nestjs/swagger'
import { IsNumber } from 'class-validator'

export class DeleteEquipmentFromQuoteDto {
  @ApiProperty()
  @IsNumber()
  equipmentID: number

  @ApiProperty()
  @IsNumber()
  quoteID: number
}
