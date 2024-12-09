import { ApiProperty } from '@nestjs/swagger'

export class EquipmentInformationV01Dto {
  @ApiProperty()
  device?: string

  @ApiProperty()
  nominal_range?: number

  @ApiProperty()
  scale_division?: string

  @ApiProperty()
  maker?: string

  @ApiProperty()
  unit?: string

  @ApiProperty()
  serial_number?: string

  @ApiProperty()
  code?: string

  @ApiProperty()
  resolution?: number

  @ApiProperty()
  material?: string

  @ApiProperty()
  neck_diameter?: string

  @ApiProperty()
  volumetric_container?: string

  @ApiProperty()
  model?: string

  @ApiProperty()
  thermometer?: string

  @ApiProperty()
  balance?: string
}
