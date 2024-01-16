import { ApiProperty } from '@nestjs/swagger'
import { ICycles_NI_MCIT_P_01 } from '../../entities/NI_MCIT_P_01/steps/environmental_conditions.entity'

export class EnvironmentalConditionsDto {
  @ApiProperty()
  cycles?: ICycles_NI_MCIT_P_01[]
}
