import { ApiProperty } from '@nestjs/swagger'
import { IResults_NI_MCIT_P_01 } from '../../entities/NI_MCIT_P_01/steps/calibration_results.entity'

export class CalibrationResultsDto {
  @ApiProperty()
  results?: IResults_NI_MCIT_P_01[]
}
