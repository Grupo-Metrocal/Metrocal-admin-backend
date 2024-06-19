import { ApiProperty } from '@nestjs/swagger'
import { IResults_NI_MCIT_M_01 } from '../../entities/NI_MCIT_M_01/steps/calibration_results.entity'

export class CalibrationResultsM01Dto {
  @ApiProperty()
  results?: IResults_NI_MCIT_M_01[]
}
