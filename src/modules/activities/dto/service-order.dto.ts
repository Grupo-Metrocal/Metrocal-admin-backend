import { ApiProperty } from '@nestjs/swagger'

export class ServiceOrderDto {
  @ApiProperty()
  start_time: string

  @ApiProperty()
  end_time: string

  @ApiProperty()
  equipments: number[]
}
