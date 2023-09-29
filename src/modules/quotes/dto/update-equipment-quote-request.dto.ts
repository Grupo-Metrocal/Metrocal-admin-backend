import { EquipmentQuoteRequestDto } from './equipment-quote-request.dto'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsBoolean } from 'class-validator'
import { PartialType } from '@nestjs/mapped-types'

export class updateEquipmentQuoteRequestDto extends PartialType(
  EquipmentQuoteRequestDto,
) {
  @ApiProperty()
  @IsNotEmpty()
  id: number
}
