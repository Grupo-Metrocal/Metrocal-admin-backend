import { ApiProperty } from '@nestjs/swagger'

class IPointNumber {
  @ApiProperty()
  point: string
}
class IMeditions {
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

export class IMeasures {
  @ApiProperty()
  nominal_patron_value: IPointNumber[]

  @ApiProperty()
  verification_lengths: IMeditions
}

export class ExteriorMeasurementAccuracyNI_MCIT_D_01Dto {
  @ApiProperty({ type: () => IMeasures })
  measure: IMeasures[]
}
