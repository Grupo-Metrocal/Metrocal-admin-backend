import { ApiProperty } from '@nestjs/swagger'
import { IsPositive, IsNumber, IsOptional, IsString } from 'class-validator'

export class PaginationQueryDinamicDto {
  @IsNumber()
  @ApiProperty()
  @IsOptional()
  limit?: number

  @IsNumber()
  @ApiProperty()
  @IsOptional()
  page?: number

  @IsString()
  @ApiProperty()
  @IsOptional()
  no?: string
}
