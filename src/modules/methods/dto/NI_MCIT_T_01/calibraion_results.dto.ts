import { ApiProperty } from '@nestjs/swagger'
import { IResults_NI_MCIT_T_01 } from '../../entities/NI_MCIT_T_01/steps/calibration_results.entity'

export class CalibrationResultsT_01Dto {
  @ApiProperty()
  results?: IResults_NI_MCIT_T_01[]
}
