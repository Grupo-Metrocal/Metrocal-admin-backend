import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm'
import { NI_MCIT_T_03 } from '../NI_MCIT_T_03.entity'

@Entity('calibration_results_NI_MCIT_T_03')
export class CalibrationResultsNI_MCIT_T_03 {
  @PrimaryGeneratedColumn('increment')
  id: number

  @OneToMany(
    () => NI_MCIT_T_03,
    (NI_MCIT_T_03) => NI_MCIT_T_03.calibration_results,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  NI_MCIT_T_03: NI_MCIT_T_03[]

  @Column('jsonb', { nullable: true })
  results?: IResults_NI_MCIT_T_03[]
}

export interface IResults_NI_MCIT_T_03 {
  cicle_number: number

  calibration_factor: {
    upward: {
      equipment: number
      pattern: number
    }
    downward: {
      equipment: number
      pattern: number
    }
  }[]
}
