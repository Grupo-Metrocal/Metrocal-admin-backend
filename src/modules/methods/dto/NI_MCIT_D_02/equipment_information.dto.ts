import { ApiProperty } from "@nestjs/swagger";

export class EquipmentInformationDto {
  @ApiProperty()
  device: string;

  @ApiProperty()
  maker: string;

  @ApiProperty()
  serial_number: string;

  @ApiProperty()
  measurement_range: string;

  @ApiProperty()
  resolution: string;

  @ApiProperty()
  model: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  legth: string;
}