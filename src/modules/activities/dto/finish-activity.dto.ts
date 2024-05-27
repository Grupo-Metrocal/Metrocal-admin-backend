import { ApiProperty } from '@nestjs/swagger'

export class FinishActivityDto {
  @ApiProperty()
  work_areas: string[]

  @ApiProperty()
  comments_insitu?: string[]
}
