import { ApiProperty } from '@nestjs/swagger'

export class PreInstallationCommentNI_MCIT_D_02Dto {
  @ApiProperty()
  comment: string

  @ApiProperty()
  accredited: boolean
}
