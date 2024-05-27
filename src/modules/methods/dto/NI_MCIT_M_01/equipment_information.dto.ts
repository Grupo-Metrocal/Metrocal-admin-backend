import { ApiProperty } from '@nestjs/swagger'

export class EquipmentInformationDto {
  @ApiProperty()
  certificate_id?: string

  @ApiProperty()
  applicant?: string

  @ApiProperty()
  calibration_object?: string

  @ApiProperty()
  manofacturer_brand?: string

  @ApiProperty()
  model?: string

  @ApiProperty()
  address_applicant?: string

  @ApiProperty()
  calibration_place?: string

  @ApiProperty()
  calibration_date?: string

  @ApiProperty()
  Service_code?: string
}
