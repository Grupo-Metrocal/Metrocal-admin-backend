import { ApiProperty } from '@nestjs/swagger'

export class EquipmentInformationNI_MCIT_B_01Dto {
  @ApiProperty()
  device: string

  @ApiProperty()
  maker: string

  @ApiProperty()
  serial_number: string

  @ApiProperty()
  range_min: number

  @ApiProperty()
  range_max: number

  @ApiProperty()
  resolution: number

  @ApiProperty()
  model: string

  @ApiProperty()
  code: string

  @ApiProperty()
  unit: string
}
