import { ApiProperty } from '@nestjs/swagger'
import { IsPositive, IsNumber, IsOptional } from 'class-validator'

export class PaginationQueryDto {
  @IsNumber()
  @ApiProperty()
  @IsOptional()
  limit?: number

  @IsNumber()
  @ApiProperty()
  @IsOptional()
  offset?: number
}
