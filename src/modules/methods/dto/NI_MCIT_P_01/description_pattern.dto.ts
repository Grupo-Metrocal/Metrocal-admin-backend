import { ApiProperty } from '@nestjs/swagger'

export class DescriptionPatternDto {
  @ApiProperty()
  observation?: string

  @ApiProperty()
  ni_mcpp_1?: number

  @ApiProperty()
  ni_mcpp_2?: number

  @ApiProperty()
  ni_mcpp_3?: number

  @ApiProperty()
  ni_mcpve?: number
}
