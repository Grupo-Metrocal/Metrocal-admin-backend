import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, isNotEmpty } from 'class-validator'

export class UpdateEquipmentRegisterDto {
  @ApiProperty() 
  @IsNotEmpty()
  method: string 
  
  @ApiProperty()
  service: string
  
  @ApiProperty()
  description: string
  
  @ApiProperty()
  measuring_range: string
  
  @ApiProperty()
  accuracy: string
  
  @ApiProperty()
  document_delivered: string 
  
  @ApiProperty()
   price: number
}

export class UpdateIvaRegisterDto{
  @ApiProperty()
  IVA:number
}