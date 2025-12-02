import { ApiProperty } from '@nestjs/swagger'
import {
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsArray,
  IsDateString,
} from 'class-validator'

export class UpdateCertificateFieldsDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  client_signature?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  work_areas?: string[]

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  comments_insitu?: string[]

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  reviewed?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  reviewed_user_id?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  is_certificate?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  start_time?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  end_time?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  finish_date?: Date

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  status?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  progress?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  responsable?: number
}
