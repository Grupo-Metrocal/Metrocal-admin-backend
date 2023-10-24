import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber } from 'class-validator'
export class CreateRoleDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string

  @ApiProperty()
  @IsNotEmpty()
  description: string

  @ApiProperty()
  @IsNotEmpty()
  label: string

  @ApiProperty()
  @IsNumber()
  priority: 1 | 2 | 3 | 4 | 5
}
