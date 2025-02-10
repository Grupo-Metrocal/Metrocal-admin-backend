import { ApiProperty } from '@nestjs/swagger'

export class DescriptionPatternGenericMethodDto {
  @ApiProperty()
  observation?: string

  @ApiProperty()
  creditable?: boolean

  @ApiProperty()
  next_calibration: string

  @ApiProperty()
  calibration_date: string

  @ApiProperty()
  patterns?: string[]
}
