import { ApiProperty } from '@nestjs/swagger'

export class DescriptionPatternNI_MCIT_D_02Dto {
  @ApiProperty()
  descriptionPattern: string[]

  @ApiProperty()
  next_calibration: string

  @ApiProperty()
  calibration_date: string
}
