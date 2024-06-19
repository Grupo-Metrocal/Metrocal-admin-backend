import { ApiProperty } from '@nestjs/swagger'
import { IPoints_NI_MCIT_M_01 } from '../../entities/NI_MCIT_M_01/steps/environmental_conditions.entity'

export class EnvironmentalConditionsM01Dto {
  @ApiProperty({ type: [Object] })
  points?: IPoints_NI_MCIT_M_01[]
}
