import { ApiProperty } from '@nestjs/swagger'

export class ParameterIdDto {
  @ApiProperty()
  id: number
}
