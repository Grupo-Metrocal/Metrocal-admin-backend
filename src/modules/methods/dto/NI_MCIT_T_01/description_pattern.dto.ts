import { ApiProperty } from '@nestjs/swagger'

export class DescriptionPatternT_01Dto {
  @ApiProperty()
  observation?: string

  @ApiProperty()
  pattern?: string

  @ApiProperty()
  creditable?: boolean

  @ApiProperty()
  show_table_international_system_units?: boolean
}
