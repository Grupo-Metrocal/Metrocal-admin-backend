import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm'
import { NI_MCIT_V_01 } from '../NI_MCIT_V_01.entity'

@Entity('calibration_results_NI_MCIT_V_01')
export class CalibrationResultsNI_MCIT_V_01 {
  @PrimaryGeneratedColumn('increment')
  id: number

  @OneToMany(
    () => NI_MCIT_V_01,
    (NI_MCIT_V_01) => NI_MCIT_V_01.calibration_results,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  NI_MCIT_V_01: NI_MCIT_V_01[]

  @Column('jsonb', { nullable: true })
  results?: IResults_NI_MCIT_V_01[]
}

export interface IResults_NI_MCIT_V_01 {
  point_number: number
  nominal_value: number

  calibrations: {
    pattern_dough: {
      full: number
      empty: number
    }
    water_temperature: number
  }[]
}
