import { ApiProperty } from '@nestjs/swagger'

export class ReviewEquipmentDto {
  @ApiProperty()
  review_comment?: string
}
