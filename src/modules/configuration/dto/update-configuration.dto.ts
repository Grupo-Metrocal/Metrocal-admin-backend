import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

export class UpdateEquipmentRegisterDto {
  @ApiProperty()
  @IsNotEmpty()
  type_service:string

  @ApiProperty()
  equipment: string[]

  @ApiProperty()
  measuring_range:string[]

 /* @ApiProperty()
  IVA:number*/
}

export class UpdateIvaRegisterDto{
  @ApiProperty()
  IVA:number
}