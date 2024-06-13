import { ApiProperty } from '@nestjs/swagger'

export class DescriptionPatternV01Dto {
  @ApiProperty()
  observation?: string

  @ApiProperty()
  pattern?: string

  @ApiProperty()
  creditable?: boolean
}
