import { ApiProperty } from '@nestjs/swagger'

export class EquipmentInformationT05Dto {
  @ApiProperty()
  device?: string

  @ApiProperty()
  temperature_min?: number

  @ApiProperty()
  temperature_max?: number

  @ApiProperty()
  maker?: string

  @ApiProperty()
  unit?: string

  @ApiProperty()
  model?: string

  @ApiProperty()
  serial_number?: string

  @ApiProperty()
  code?: string

  @ApiProperty()
  type_thermometer?: string

  @ApiProperty()
  resolution?: number

  @ApiProperty()
  no_points?: number

  @ApiProperty()
  no_readings?: number
}
