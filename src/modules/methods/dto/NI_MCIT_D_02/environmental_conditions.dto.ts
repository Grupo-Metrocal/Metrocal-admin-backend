import { ApiProperty } from "@nestjs/swagger";
import { ICycles_NI_MCIT_D_02, ITime_NI_MCIT_D_02 } from "../../entities/NI_MCIT_D_02/steps/environmental_conditions.entity";

export class EnvironmentalConditionsDto {
    @ApiProperty()
    cycles: ICycles_NI_MCIT_D_02[];
    
    @ApiProperty()
    equipment_used: string;
    
    @ApiProperty()
    time: ITime_NI_MCIT_D_02;
    
    @ApiProperty()
    stabilization_site: string;
}