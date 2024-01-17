import { ApiProperty } from '@nestjs/swagger'

export class EquipmentInformationDtoNI_MCIT_D_01 {

    @ApiProperty()
    device?: string
  
    @ApiProperty()
    maker?: string
  
    @ApiProperty()
    serial_number?: string
  
    @ApiProperty()
    measurement_range?: string
  
    @ApiProperty()
    resolution?: number
  
    @ApiProperty()
    model?: string
  
    @ApiProperty()
    code?: string
  
    @ApiProperty()
    length?: number
}