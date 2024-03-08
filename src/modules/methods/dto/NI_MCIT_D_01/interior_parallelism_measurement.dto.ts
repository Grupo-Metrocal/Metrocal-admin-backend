import { ApiProperty } from '@nestjs/swagger'

class IMeasurements {
  @ApiProperty()
  exterior: number

  @ApiProperty()
  interior: number
}

export class InteriorParallelismMeasurementNI_MCIT_D_01Dto {
  @ApiProperty()
  point_number?: number

  @ApiProperty()
  x1: IMeasurements

  @ApiProperty()
  x2: IMeasurements

  @ApiProperty()
  x3: IMeasurements

  @ApiProperty()
  x4: IMeasurements

  @ApiProperty()
  x5: IMeasurements
}
