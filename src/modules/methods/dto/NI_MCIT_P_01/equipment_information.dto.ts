import { ApiProperty } from '@nestjs/swagger'

export class EquipmentInformationDto {
  @ApiProperty()
  device?: string

  @ApiProperty()
  serial_number?: string

  @ApiProperty()
  range_min?: number

  @ApiProperty()
  range_max?: number

  @ApiProperty()
  maker?: string

  @ApiProperty()
  accuracy_class?: string

  @ApiProperty()
  unit?: string

  @ApiProperty()
  model?: string

  @ApiProperty()
  code?: string

  @ApiProperty()
  height_difference?: number

  @ApiProperty()
  resolution?: number

  @ApiProperty()
  scale?: number
}
