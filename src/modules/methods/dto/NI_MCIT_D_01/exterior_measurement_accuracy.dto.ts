import { ApiProperty } from '@nestjs/swagger'

class IMeasure {
  @ApiProperty()
  x1: number

  @ApiProperty()
  x2: number

  @ApiProperty()
  x3: number

  @ApiProperty()
  x4: number

  @ApiProperty()
  x5: number
}

export class ExteriorMeasurementAccuracyNI_MCIT_D_01Dto {
  @ApiProperty()
  nominal_patron_value: number

  @ApiProperty({ type: () => [IMeasure] })
  measure: IMeasure[]
}
