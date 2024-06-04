import { ApiProperty } from '@nestjs/swagger'
import { IPoints_NI_MCIT_T_05 } from '../../entities/NI_MCIT_T_05/steps/environmental_conditions.entity'

export class EnvironmentalConditionsT05Dto {
  @ApiProperty()
  points?: IPoints_NI_MCIT_T_05[]
}
