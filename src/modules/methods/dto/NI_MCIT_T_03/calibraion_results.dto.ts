import { ApiProperty } from '@nestjs/swagger'
import { IResults_NI_MCIT_T_03 } from '../../entities/NI_MCIT_T_03/steps/calibration_results.entity'

export class CalibrationResultsDto {
  @ApiProperty()
  results?: IResults_NI_MCIT_T_03[]
}
