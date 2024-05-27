import { ApiProperty } from '@nestjs/swagger'

export class DataDto {
  @ApiProperty()
  data: Data[]
}

class Data {
  pattern_to_use: string[]
  ms: string
  nominal_mass_value: number
  nominal_mass_unit_measure: string
  calibrating_material:
    | 'Platino'
    | 'Aleación de Níquel'
    | 'Bronce'
    | 'Acero Inoxidable'
    | 'Acero Carbón'
    | 'Hierro'
    | 'Hierro fund (blanco)'
    | 'Hierro fundido (gris)'
    | 'Aluminio'
    | 'Plomo'
  balance: 'Cobos Precision, S. L.' | 'Precisa Gravimetrics ES Swiss' | 'N/A'
  thermometer_hygrometer: 'Fluke 971' | 'Testo 608-H1' | 'Extech' | ''
  environmental_condition: ICycles_NI_MCIT_M_01
  measurements: Measurements_NI_MCIT_M_01[]
  calibration_date: string
  code: string
  accuracy_class: 'E1' | 'E2' | 'F1' | 'F2' | 'M1' | 'M2' | 'M3'
  NI_MCIT_M_01: any
}

class ICycles_NI_MCIT_M_01 {
  tac: {
    initial: number
    final: number
  }
  hrp: {
    initial: number
    final: number
  }
  pressure: {
    initial: number
    final: number
  }
}

class Measurements_NI_MCIT_M_01 {
  l1: number
  l2: number
  l3: number
  l4: number
}
