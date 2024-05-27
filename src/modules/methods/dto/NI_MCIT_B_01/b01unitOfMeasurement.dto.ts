import { ApiProperty } from '@nestjs/swagger'

export class UnitOfMeasurementNI_MCIT_B_01Dto {
  @ApiProperty()
  measure: string

  @ApiProperty()
  resolution: number
}
