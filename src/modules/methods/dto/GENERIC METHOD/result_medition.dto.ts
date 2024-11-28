import { ApiProperty } from '@nestjs/swagger'
import { IMedition } from '../../entities/GENERIC METHOD/steps/result_medition.entity'

export class Result_MeditionGENERIC_METHODDto {
  @ApiProperty()
  meditions?: IMedition[]
}
