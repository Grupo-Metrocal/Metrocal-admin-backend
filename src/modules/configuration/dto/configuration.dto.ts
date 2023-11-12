import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

export class CreateConfigurationDto {
  @ApiProperty()
  @IsNotEmpty()
  type_service:string

  @ApiProperty()
  @IsNotEmpty()
  equipment: string

  @ApiProperty()
  @IsNotEmpty()
  measuring_range:string


}

export class AddConfigurationDto {
  @ApiProperty()
  id: number
}

