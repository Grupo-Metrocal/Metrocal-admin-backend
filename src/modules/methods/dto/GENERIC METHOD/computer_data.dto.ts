import { ApiProperty } from "@nestjs/swagger";

export class ComputerDataGENERIC_METHODDto {  
    @ApiProperty()
    unit_of_measurement: string

    @ApiProperty()
    scale_unit : string

}
