import { ApiProperty } from '@nestjs/swagger'
import { IResults_NI_MCIT_T_05 } from '../../entities/NI_MCIT_T_05/steps/calibration_results.entity'

export class CalibrationResultsT05Dto {
  @ApiProperty()
  results?: IResults_NI_MCIT_T_05[]
}
