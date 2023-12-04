import { IsNotEmpty, IsNumber, IsEmail, IsString } from 'class-validator'

export class RejectedQuoteRequest {
  @IsNotEmpty()
  clientName: string

  @IsNotEmpty()
  linkToNewQuote: string

  @IsNotEmpty()
  @IsEmail()
  email: string

  @IsString()
  @IsNotEmpty()
  comment: string
}