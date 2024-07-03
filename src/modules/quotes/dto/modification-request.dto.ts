import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber } from 'class-validator'

export class ModificationRequestDto {
  @ApiProperty()
  @IsNumber()
  id: number

  @ApiProperty()
  @IsNotEmpty()
  message: string
}
