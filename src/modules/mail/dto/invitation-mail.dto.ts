import { IsNotEmpty, IsNumber, IsEmail } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
export class InvitationMail {
  
  linkToNewQuote?: string

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string

}