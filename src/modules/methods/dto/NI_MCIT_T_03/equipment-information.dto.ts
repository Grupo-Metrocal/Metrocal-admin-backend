import { ApiProperty } from '@nestjs/swagger'

export class EquipmentInformationDto {
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
  resolution?: number

  @ApiProperty()
  sensor?: string
}
