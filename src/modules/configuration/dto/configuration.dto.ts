import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

export class CreateEquipmentRegisterDto {
@ApiProperty()
@IsNotEmpty()  
method: string 

@ApiProperty()
@IsNotEmpty()    
service: string

@ApiProperty()
@IsNotEmpty()    
description: string

@ApiProperty()
@IsNotEmpty()    
measuring_range: string

@ApiProperty()
@IsNotEmpty()    
accuracy: string

@ApiProperty()
@IsNotEmpty()    
document_delivered: string 

@ApiProperty()
@IsNotEmpty()   
 price: number

}


