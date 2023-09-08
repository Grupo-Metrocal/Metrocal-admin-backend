import { PartialType } from '@nestjs/mapped-types'
import { CreateRoleDto } from './create-role.dto'
import { IsNumber } from 'class-validator'

export class UpdateRoleDto extends PartialType(CreateRoleDto) {
  @IsNumber()
  id: number
}
