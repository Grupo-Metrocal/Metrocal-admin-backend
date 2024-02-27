import { IsNumber } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class addOrRemoveMethodToStackDto {
  @ApiProperty()
  @IsNumber()
  methodsStackID: number

  @ApiProperty()
  @IsNumber()
  quoteRequestID: number
}
