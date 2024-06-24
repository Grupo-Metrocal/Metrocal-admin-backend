import { ApiProperty } from "@nestjs/swagger"

export class EnvironmentalConditionsGENERIC_METHODDto {
  @ApiProperty()
  temperature: number

  @ApiProperty()
  hr: number

  @ApiProperty()
  equipment_used: string

}