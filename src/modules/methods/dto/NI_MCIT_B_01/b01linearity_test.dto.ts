import { ApiProperty } from '@nestjs/swagger'

class IPointsComposition {
  @ApiProperty()
  point: string
}

class ILinearityTest {
  @ApiProperty()
  point: number
  @ApiProperty()
  pointsComposition: IPointsComposition[]
  @ApiProperty()
  indicationIL: number
  @ApiProperty()
  noLoadInfdication: number
}

export class LinearityTestNI_MCIT_B_01Dto {
  @ApiProperty({ type: () => ILinearityTest })
  linearity_test?: ILinearityTest[]
}
