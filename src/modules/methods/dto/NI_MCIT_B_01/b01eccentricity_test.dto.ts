import { ApiProperty } from '@nestjs/swagger'

class IEccentricityTest {
  @ApiProperty()
  indicationIL: number
  @ApiProperty()
  noLoadInfdication: number
}

export class EccentricityTestNI_MCIT_B_01Dto {
  @ApiProperty()
  pointNumber?: number

  @ApiProperty({ type: () => IEccentricityTest })
  eccentricity_test?: IEccentricityTest[]
}
