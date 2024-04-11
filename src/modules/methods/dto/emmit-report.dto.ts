import { ApiProperty } from '@nestjs/swagger'

export class EmmitReportDto {
  @ApiProperty()
  method_name: string

  @ApiProperty()
  report: string
}
