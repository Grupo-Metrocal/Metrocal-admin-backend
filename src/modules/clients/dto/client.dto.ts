import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsEmail } from 'class-validator'

export class CreateClientDto {
  @ApiProperty()
  @IsNotEmpty()
  company_name: string

  @ApiProperty()
  @IsNotEmpty()
  no: string

  @ApiProperty()
  @IsNotEmpty()
  phone: string

  @ApiProperty()
  @IsNotEmpty()
  address: string

  @ApiProperty()
  @IsNotEmpty()
  no_ruc: string

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string

  @ApiProperty()
  @IsNotEmpty()
  requested_by: string
}
