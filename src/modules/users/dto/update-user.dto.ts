import { PartialType } from '@nestjs/mapped-types'
import { IsNumber } from 'class-validator'
import { userDto } from './user-dto'

export class UpdateUserDto extends PartialType(userDto) {
  @IsNumber()
  id: number
}
