import { IsNotEmpty, IsNumber, IsEmail } from 'class-validator'

export class RejectedCuoteRequest {
  @IsNotEmpty()
  clientName: string

  @IsNotEmpty()
  linkToNewQuote: string

  @IsNotEmpty()
  @IsEmail()
  email: string
}