import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'
import { IMethods } from 'src/modules/methods/entities/method.entity'

export class CreatePatternDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  method: IMethods

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  equipment: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  code: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  certificate: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  traceability: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  pattern_range?: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  next_calibration: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  brand: string
}
