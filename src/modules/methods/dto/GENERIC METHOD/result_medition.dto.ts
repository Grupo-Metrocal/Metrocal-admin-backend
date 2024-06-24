import { ApiProperty } from "@nestjs/swagger"

class IMedition {
    @ApiProperty()
    patron1: number
    @ApiProperty()
    equiopo1: number
    @ApiProperty()
    patron2: number
    @ApiProperty()
    equiopo2: number
    @ApiProperty()
    patron3: number
    @ApiProperty()
    equiopo3: number
}
export class Result_MeditionGENERIC_METHODDto {
    @ApiProperty({ type: () => IMedition })
    medition: IMedition[]
}