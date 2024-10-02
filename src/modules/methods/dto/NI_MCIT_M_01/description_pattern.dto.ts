import { ApiProperty } from '@nestjs/swagger'

export class DescriptionPatternM01Dto {
  @ApiProperty()
  observation?: string

  @ApiProperty()
  creditable?: boolean

  @ApiProperty()
  next_calibration: string
}
