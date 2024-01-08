import { ApiProperty } from "@nestjs/swagger";

export class InstrumentZeroCheckDto {
  @ApiProperty()
  x1: number;

  @ApiProperty()
  x2: number;

  @ApiProperty()
  x3: number;

  @ApiProperty()
  x4: number;

  @ApiProperty()
  x5: number;

  @ApiProperty()
  nominal_value: number;
}