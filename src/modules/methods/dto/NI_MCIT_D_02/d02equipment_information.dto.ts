import { ApiProperty } from '@nestjs/swagger'

export class EquipmentInformationNI_MCIT_D_02Dto {
  @ApiProperty()
  device: string

  @ApiProperty()
  maker: string

  @ApiProperty()
  serial_number: string

  @ApiProperty()
  measurement_range: string

  @ApiProperty()
  resolution: number

  @ApiProperty()
  model: string

  @ApiProperty()
  code: string

  @ApiProperty()
  length: string

  @ApiProperty()
  date: string
}
