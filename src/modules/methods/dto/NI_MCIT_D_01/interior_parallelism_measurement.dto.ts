import { ApiProperty } from '@nestjs/swagger'

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

class IPlaces {
  @ApiProperty()
  Exterior: IMeditions

  @ApiProperty()
  Interior: IMeditions
}

class IMeasurementsD01 {
  @ApiProperty()
  nominal_patron: string

  @ApiProperty()
  verification_lengths: IPlaces
}
export class InteriorParallelismMeasurementNI_MCIT_D_01Dto {
  @ApiProperty({ type: () => IMeasurementsD01 })
  measurementsd01?: IMeasurementsD01[]
}
