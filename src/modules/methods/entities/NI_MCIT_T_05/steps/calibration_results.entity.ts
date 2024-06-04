import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm'
import { NI_MCIT_T_05 } from '../NI_MCIT_T_05.entity'

@Entity('calibration_results_NI_MCIT_T_05')
export class CalibrationResultsNI_MCIT_T_05 {
  @PrimaryGeneratedColumn('increment')
  id: number

  @OneToMany(
    () => NI_MCIT_T_05,
    (NI_MCIT_T_05) => NI_MCIT_T_05.calibration_results,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  NI_MCIT_T_05: NI_MCIT_T_05[]

  @Column('jsonb', { nullable: true })
  results?: IResults_NI_MCIT_T_05[]
}

export interface IResults_NI_MCIT_T_05 {
  temperature: number
  point_number: number

  calibrations: {
    initial: number
    final: number
  }
}
