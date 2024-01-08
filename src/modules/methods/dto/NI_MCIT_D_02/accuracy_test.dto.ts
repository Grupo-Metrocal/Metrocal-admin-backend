import { ApiProperty } from "@nestjs/swagger";
import { IMeasure } from "../../entities/NI_MCIT_D_02/steps/accuracy_test.entity";

export class AccuracyTestNI_MCIT_D_02Dto {
  @ApiProperty()
  nominal_value: number;

  @ApiProperty()
  measure: IMeasure[];
}