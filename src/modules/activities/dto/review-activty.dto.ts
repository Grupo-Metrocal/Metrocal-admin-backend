import { ApiProperty } from '@nestjs/swagger'

export class ReviewActivityDto {
  @ApiProperty()
  token: string
}
