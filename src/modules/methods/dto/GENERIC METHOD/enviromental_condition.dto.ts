import { ApiProperty } from "@nestjs/swagger"

export class EnvironmentalConditionsDto {
  @ApiProperty()
  temperature: number

  @ApiProperty()
  hr: number

  @ApiProperty()
  equipment_used: string

}