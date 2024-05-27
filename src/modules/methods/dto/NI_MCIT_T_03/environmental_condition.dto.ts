import { ApiProperty } from '@nestjs/swagger'

export class EnvironmentalConditionsDto {
  @ApiProperty()
  temperature: number

  @ApiProperty()
  humidity: number

  @ApiProperty()
  pattern: string
}
