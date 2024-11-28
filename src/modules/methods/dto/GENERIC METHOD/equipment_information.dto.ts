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
  measurement_range?: string

  @ApiProperty()
  scale_interval?: string

  @ApiProperty()
  code?: string

  @ApiProperty()
  length?: string

  @ApiProperty()
  estabilization_site?: string
}
