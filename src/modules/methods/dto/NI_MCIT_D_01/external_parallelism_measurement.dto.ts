import { ApiProperty } from '@nestjs/swagger'
import { Meditions_NI_MCIT_D_01 } from '../../entities/NI_MCIT_D_01/steps/external_parallelism_measurement.entity'

export class ExternalParallelismMeasurementDtoNI_MCIT_D_01 {
  @ApiProperty()
  external_parallelism_measurement?: Meditions_NI_MCIT_D_01[]
}
