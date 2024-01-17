import { ApiProperty } from '@nestjs/swagger'

class ICycles {
  @ApiProperty()
  initial: number

  @ApiProperty()
  end: number
}
class ICycles_NI_MCIT_D_02 {
  @ApiProperty()
  ta: ICycles

  @ApiProperty()
  hr: ICycles
}

class ITime_NI_MCIT_D_02 {
  @ApiProperty()
  hour: number

  @ApiProperty()
  minute: number
}

export class EnvironmentalConditionsNI_MCIT_D_02Dto {
  @ApiProperty({ type: () => ICycles_NI_MCIT_D_02 })
  cycles: ICycles_NI_MCIT_D_02

  @ApiProperty()
  equipment_used: string

  @ApiProperty({ type: () => ITime_NI_MCIT_D_02 })
  time: ITime_NI_MCIT_D_02

  @ApiProperty()
  stabilization_site: string
}
