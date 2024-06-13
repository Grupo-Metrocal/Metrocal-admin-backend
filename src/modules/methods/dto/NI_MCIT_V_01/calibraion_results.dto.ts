import { ApiProperty } from '@nestjs/swagger'
import { IResults_NI_MCIT_V_01 } from '../../entities/NI_MCIT_V_01/steps/calibration_results.entity'

export class CalibrationResultsV01Dto {
  @ApiProperty()
  results?: IResults_NI_MCIT_V_01[]
}
