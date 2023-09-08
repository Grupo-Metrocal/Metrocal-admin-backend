import { PartialType } from '@nestjs/mapped-types'
import { IsNumber } from 'class-validator'
import { userDto } from './user-dto'
import { ApiProperty } from '@nestjs/swagger'

export class UpdateUserDto extends PartialType(userDto) {
  @ApiProperty()
  @IsNumber()
  id: number
}
