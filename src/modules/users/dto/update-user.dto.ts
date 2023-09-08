import { PartialType } from '@nestjs/mapped-types'
import { IsNumber } from 'class-validator'
import { CreateUserDto } from './create-user.dto'
import { ApiProperty } from '@nestjs/swagger'

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty()
  @IsNumber()
  id: number
}
