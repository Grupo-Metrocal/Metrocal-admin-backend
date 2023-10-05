import { IsNotEmpty, IsNumber, IsEmail } from 'class-validator'

export class ApprovedQuoteRequestDto {
  @IsNotEmpty()
  clientName: string

  @IsNotEmpty()
  servicesAndEquipments: {
    service: string
    equipment: string
    count: number
    unitPrice: number
    subTotal: number
  }[]

  @IsNumber()
  @IsNotEmpty()
  total: number

  @IsNotEmpty()
  linkDetailQuote: string

  @IsNotEmpty()
  @IsEmail()
  email: string

  @IsNotEmpty()
  token: string

  @IsNotEmpty()
  subtotal: number

  @IsNotEmpty()
  tax: number

  @IsNotEmpty()
  discount: number
}
