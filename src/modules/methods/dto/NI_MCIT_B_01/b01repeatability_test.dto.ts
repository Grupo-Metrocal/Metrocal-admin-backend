import { ApiProperty } from '@nestjs/swagger'

export class RepeatabilityTestNI_MCIT_B_01Dto {
  @ApiProperty()
  pointNumber?: number

  @ApiProperty({ type: () => IRepeatabilityTest })
  repeatability_test?: IRepeatabilityTest[]
}

class IRepeatabilityTest {
  @ApiProperty()
  indicationIL: number
  @ApiProperty()
  noLoadInfdication: number
}
