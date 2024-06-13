import { ApiProperty } from '@nestjs/swagger'
import { IPoints_NI_MCIT_V_01 } from '../../entities/NI_MCIT_V_01/steps/environmental_conditions.entity'

export class EnvironmentalConditionsV01Dto {
  @ApiProperty()
  points?: IPoints_NI_MCIT_V_01[]
}
