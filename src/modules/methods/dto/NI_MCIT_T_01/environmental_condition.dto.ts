import { ApiProperty } from '@nestjs/swagger'
import { ICycles_NI_MCIT_T_01 } from '../../entities/NI_MCIT_T_01/steps/environmental_conditions.entity'

export class EnvironmentalConditionsT_01Dto {
  @ApiProperty()
  environment?: ICycles_NI_MCIT_T_01
}
