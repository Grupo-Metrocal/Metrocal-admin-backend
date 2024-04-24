import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm'
import { NI_MCIT_T_01 } from '../NI_MCIT_T_01.entity'

@Entity('calibration_results_NI_MCIT_T_01')
export class CalibrationResultsNI_MCIT_T_01 {
  @PrimaryGeneratedColumn('increment')
  id: number

  @OneToMany(
    () => NI_MCIT_T_01,
    (NI_MCIT_P_01) => NI_MCIT_P_01.calibration_results,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  NI_MCIT_T_01: NI_MCIT_T_01[]

  @Column('jsonb', { nullable: true })
  results?: IResults_NI_MCIT_T_01[]
}

export interface IResults_NI_MCIT_T_01 {
  indication_linear: {
    patron: number
    thermometer: number
  }[]
}
