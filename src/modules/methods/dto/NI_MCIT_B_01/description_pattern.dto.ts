import { ApiProperty } from '@nestjs/swagger'

export class DescriptionPatternB01Dto {
  @ApiProperty()
  observation?: string

  @ApiProperty()
  creditable?: boolean
}
