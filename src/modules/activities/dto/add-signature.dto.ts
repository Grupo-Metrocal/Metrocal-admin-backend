import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

export class AddSignatureDto {
  @ApiProperty()
  @IsNotEmpty()
  imageURL: string
}
