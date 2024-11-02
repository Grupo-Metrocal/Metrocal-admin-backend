import { ApiProperty } from '@nestjs/swagger'

export class DescriptionPatternT05Dto {
  @ApiProperty()
  observation?: string

  @ApiProperty()
  pattern?: string

  @ApiProperty()
  creditable?: boolean

  @ApiProperty()
  next_calibration: string

  @ApiProperty()
  calibration_date: string
}
