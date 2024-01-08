import { ApiProperty } from '@nestjs/swagger'

export class descriptionPatternDto {
  @ApiProperty()
  NI_MCPD_01: string

  @ApiProperty()
  NI_MCPD_02: string

  @ApiProperty()
  NI_MCPD_03: string

  @ApiProperty()
  NI_MCPD_04: string
}
