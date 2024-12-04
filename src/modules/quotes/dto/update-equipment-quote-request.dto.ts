import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsBoolean } from 'class-validator'

export class updateEquipmentQuoteRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  id: number

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
  model: string

  @ApiProperty()
  measuring_range?: string

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
  comment?: string

  @ApiProperty()
  price?: number

  @ApiProperty()
  total?: number

  @ApiProperty()
  is_creditable: boolean

  @ApiProperty()
  use_alternative_certificate_method?: string
}
