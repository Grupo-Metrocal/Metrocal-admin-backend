import { ApiProperty } from '@nestjs/swagger'

export class AccuracyTestNI_MCIT_D_02Dto {
  @ApiProperty()
  nominal_value: number

  @ApiProperty({ type: () => [IMeasure] })
  measure: IMeasure[]
}

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
