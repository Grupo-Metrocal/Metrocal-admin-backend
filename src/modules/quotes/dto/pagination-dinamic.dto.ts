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
  offset?: number

  @IsString({ each: true }) // Ensure each element of the array is a string
  @ApiProperty({ type: [String] })
  @IsOptional()
  status?: string[]

  @IsString()
  @ApiProperty()
  @IsOptional()
  no_quote?: string
}
