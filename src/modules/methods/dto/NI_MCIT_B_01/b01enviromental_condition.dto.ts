import { ApiProperty } from '@nestjs/swagger'
class ICicles {
  @ApiProperty()
  initial: number

  @ApiProperty()
  end: number
}

class ICycles_NI_MCIT_B_01 {
  @ApiProperty()
  ta: ICicles

  @ApiProperty()
  hr: ICicles

  @ApiProperty()
  hPa: ICicles
}

class ITime_NI_MCIT_B_01 {
  @ApiProperty()
  hours: number
  @ApiProperty()
  minute: number
}

export class EnviromentalConditionsNI_MCIT_B_01Dto {
  @ApiProperty({ type: () => ICycles_NI_MCIT_B_01 })
  cycles?: ICycles_NI_MCIT_B_01

  @ApiProperty()
  equipment_used?: string

  @ApiProperty({ type: () => ITime_NI_MCIT_B_01 })
  time?: ITime_NI_MCIT_B_01

  @ApiProperty()
  stabilization_site?: string
}
