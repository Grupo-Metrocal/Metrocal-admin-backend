import { ApiProperty } from '@nestjs/swagger'

export class EquipmentInformationDto {
  @ApiProperty()
  device?: string

  @ApiProperty()
  serial_number?: string

  @ApiProperty()
  measurement_range?: string

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
  height_difference?: string

  @ApiProperty()
  resolution?: string

  @ApiProperty()
  scale?: number
}
