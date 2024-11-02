import { ApiProperty } from '@nestjs/swagger'

export class DescriptionPatternNI_MCIT_D_01Dto {
  @ApiProperty()
  descriptionPatterns: string[]

  @ApiProperty()
  next_calibration: string

  @ApiProperty()
  calibration_date: string
}
