import { ApiProperty } from '@nestjs/swagger'

export class DescriptionPatternB01Dto {
  @ApiProperty()
  observation?: string

  @ApiProperty()
  creditable?: boolean

  @ApiProperty()
  show_additional_table?: 'lb' | 'kg' | ''
}
