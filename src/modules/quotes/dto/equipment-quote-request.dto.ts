import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsBoolean } from 'class-validator'

export class EquipmentQuoteRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string

  @ApiProperty()
  @IsNotEmpty()
  type_service: string

  @ApiProperty()
  @IsNumber()
  count: number

  @ApiProperty()
  @IsNotEmpty()
  model: string

  @ApiProperty()
  @IsBoolean()
  measuring_range: boolean

  @ApiProperty()
  calibration_method?: string

  @ApiProperty()
  additional_remarks?: string

  @ApiProperty()
  @IsNumber()
  discount: number

  @ApiProperty()
  @IsNotEmpty()
  status?: string // done, rejected, pending

  @ApiProperty()
  @IsNotEmpty()
  comment?: string

  @ApiProperty()
  price?: number

  @ApiProperty()
  total?: number
}
