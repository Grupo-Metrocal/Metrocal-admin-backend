import { ApiProperty } from '@nestjs/swagger'
import { InstrumentZero_NI_MCIT_D_01 } from '../../entities/NI_MCIT_D_01/steps/Instrument_zero_check.entity'

export class InstrumentZeroCheckDtoNI_MCIT_D_01 {
  @ApiProperty()
  instrument_zero_check?: InstrumentZero_NI_MCIT_D_01[]
}
