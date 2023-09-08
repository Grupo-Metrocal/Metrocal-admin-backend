import { PartialType } from '@nestjs/mapped-types'
import { userDto } from './user-dto'
export class CreateUserDto extends PartialType(userDto) {}
