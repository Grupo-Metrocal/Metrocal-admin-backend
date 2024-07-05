import { ApiProperty } from '@nestjs/swagger'

export class OptionsCMCOnCertificateDto {
  @ApiProperty()
  optionsCMCOnCertificate: 'asterisks' | 'change_values'

  @ApiProperty()
  method_id: number

  @ApiProperty()
  method_name: string
}
