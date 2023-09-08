import { PartialType } from '@nestjs/mapped-types'
import { CreateRoleDto } from './create-role.dto'
import { IsNumber } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class UpdateRoleDto extends PartialType(CreateRoleDto) {
  @ApiProperty()
  @IsNumber()
  id: number
}
