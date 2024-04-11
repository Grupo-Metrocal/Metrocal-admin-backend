import { IsNotEmpty, IsEmail, IsString } from 'class-validator'

export class ServiceOrderDto {
  @IsNotEmpty()
  @IsEmail()
  to: string

  @IsNotEmpty()
  @IsString()
  clientName: string

  @IsNotEmpty()
  @IsString()
  quoteNumber: string

  @IsNotEmpty()
  @IsString()
  startDate: string

  @IsNotEmpty()
  @IsString()
  endDate: string

  technicians: string[]

  @IsNotEmpty()
  pdf: Buffer
}
