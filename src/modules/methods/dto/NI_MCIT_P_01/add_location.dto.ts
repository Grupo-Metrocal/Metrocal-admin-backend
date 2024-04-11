import { ApiProperty } from '@nestjs/swagger'

export class AddLocationDto {
  @ApiProperty()
  location?: string
}
