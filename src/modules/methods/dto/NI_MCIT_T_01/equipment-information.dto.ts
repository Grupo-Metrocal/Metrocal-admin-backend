import { ApiProperty } from '@nestjs/swagger'

export class EquipmentInformationDto {
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
  code?: string

  @ApiProperty()
  resolution?: number
}
