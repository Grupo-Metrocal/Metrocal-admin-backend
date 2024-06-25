import { ApiProperty } from '@nestjs/swagger'

export class CertificationDetailsDto {
  @ApiProperty()
  location?: string

  @ApiProperty()
  applicant_address?: string

  @ApiProperty()
  applicant_name: string
}
