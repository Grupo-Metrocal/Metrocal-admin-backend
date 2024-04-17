import { ApiProperty } from '@nestjs/swagger'

class IPointNumber {
  @ApiProperty()
  point: string
}

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
  @ApiProperty()
  x6: number
  @ApiProperty()
  x7: number
  @ApiProperty()
  x8: number
  @ApiProperty()
  x9: number
  @ApiProperty()
  x10: number
}

class IMeasure {
  @ApiProperty()
  nominal_value: IPointNumber[]
  @ApiProperty()
  varification_lengths: IMedition
}

export class AccuracyTestNI_MCIT_D_02Dto {
  @ApiProperty({ type: () => [IMeasure] })
  measure: IMeasure[]
}
