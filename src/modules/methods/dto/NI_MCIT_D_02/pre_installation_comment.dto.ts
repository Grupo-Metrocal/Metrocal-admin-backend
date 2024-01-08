import { ApiProperty } from '@nestjs/swagger'

export class PreInstallationCommentDto {
  @ApiProperty()
  comment: string
}
