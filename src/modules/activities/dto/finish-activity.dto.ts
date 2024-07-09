import { ApiProperty } from '@nestjs/swagger'

export class FinishActivityDto {
  @ApiProperty()
  work_areas: string[]

  @ApiProperty()
  comments_insitu?: string[]

  @ApiProperty()
  start_time: string

  @ApiProperty()
  end_time: string
}
