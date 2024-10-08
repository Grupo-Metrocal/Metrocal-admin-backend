import { IsNotEmpty } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class UpdateUserDto {
  @ApiProperty()
  @IsNotEmpty()
  username: string

  // @ApiProperty()
  // email: string

  // @ApiProperty()
  // password: string

  @ApiProperty()
  imageURL: string
}
