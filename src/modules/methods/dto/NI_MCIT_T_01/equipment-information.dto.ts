import { ApiProperty } from '@nestjs/swagger'

export class EquipmentInformationT_01Dto {
  @ApiProperty()
  device?: string

  @ApiProperty()
  range_min?: number

  @ApiProperty()
  range_max?: number

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
  probe_type?: string
}
