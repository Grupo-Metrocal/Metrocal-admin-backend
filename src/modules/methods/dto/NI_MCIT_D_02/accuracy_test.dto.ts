import { ApiProperty } from "@nestjs/swagger";
import { IMeasure } from "../../entities/NI_MCIT_D_02/steps/accuracy_test.entity";

export class AccuracyTestDto {
  @ApiProperty()
  nominal_value: number;

  @ApiProperty()
  measure: IMeasure[];
}