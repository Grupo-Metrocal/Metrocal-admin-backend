import { ApiProperty } from '@nestjs/swagger'
class IMedition {
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

class IPlace {
  @ApiProperty()
  Exterior: IMedition

  @ApiProperty()
  Interior: IMedition
}

class IMeasurements {
  @ApiProperty()
  nominal_patron: string

  @ApiProperty()
  verification_lengths: IPlace
}
export class InteriorParallelismMeasurementNI_MCIT_D_01Dto {
  @ApiProperty({ type: () => IMeasurements })
  measurements?: IMeasurements[]
}
