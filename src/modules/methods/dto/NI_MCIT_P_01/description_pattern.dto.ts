import { ApiProperty } from '@nestjs/swagger'

export class DescriptionPatternDto {
  @ApiProperty()
  observation?: string

  @ApiProperty()
  pattern?: string

  @ApiProperty()
  creditable?: boolean

  @ApiProperty()
  next_calibration: string

  @ApiProperty()
  show_table_international_system_units: boolean
}
