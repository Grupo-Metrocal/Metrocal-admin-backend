import { ApiProperty } from '@nestjs/swagger'

export class DescriptionPatternDto {
  @ApiProperty()
  observation?: string

  @ApiProperty()
  pattern?: string

  @ApiProperty()
  creditable?: boolean
}
