import { ApiProperty } from '@nestjs/swagger'

export class DescriptionPatternV01Dto {
  @ApiProperty()
  observation?: string

  @ApiProperty()
  patterns?: string[]

  @ApiProperty()
  creditable?: boolean

  @ApiProperty()
  next_calibration: string

  @ApiProperty()
  calibration_date: string
}
