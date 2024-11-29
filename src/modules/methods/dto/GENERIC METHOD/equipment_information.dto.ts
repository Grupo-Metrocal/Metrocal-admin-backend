import { ApiProperty } from '@nestjs/swagger'

export class EquipmentInformationGENERIC_METHODDto {
  @ApiProperty()
  device?: string

  @ApiProperty()
  maker?: string

  @ApiProperty()
  serial_number?: string

  @ApiProperty()
  model?: string

  @ApiProperty()
  unit?: string

  @ApiProperty()
  range_min: number

  @ApiProperty()
  range_max: number

  @ApiProperty()
  scale_interval?: number

  @ApiProperty()
  code?: string

  @ApiProperty()
  estabilization_site?: string
}
