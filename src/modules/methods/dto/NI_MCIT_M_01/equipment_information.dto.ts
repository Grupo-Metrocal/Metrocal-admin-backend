import { ApiProperty } from '@nestjs/swagger'

export class EquipmentInformationDto {
  @ApiProperty()
  code?: string

  @ApiProperty()
  calibration_object?: string

  @ApiProperty()
  maker?: string

  @ApiProperty()
  model?: string

}
