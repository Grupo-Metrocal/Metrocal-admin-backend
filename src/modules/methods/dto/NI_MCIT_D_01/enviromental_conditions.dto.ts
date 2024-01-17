import { ApiProperty } from '@nestjs/swagger'
import { EnvConditions_NI_MCIT_D_01 } from '../../entities/NI_MCIT_D_01/steps/enviromental_conditions.entity'

export class EnvironmentalConditionsDtoNI_MCIT_D_01 {
  @ApiProperty()
  environmental_conditions?: EnvConditions_NI_MCIT_D_01[]
}