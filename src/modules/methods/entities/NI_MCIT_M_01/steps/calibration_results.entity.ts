import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm'
import { NI_MCIT_M_01 } from '../NI_MCIT_M_01.entity'

@Entity('calibration_results_NI_MCIT_M_01')
export class CalibrationResultsNI_MCIT_M_01 {
  @PrimaryGeneratedColumn('increment')
  id: number

  @OneToMany(
    () => NI_MCIT_M_01,
    (NI_MCIT_M_01) => NI_MCIT_M_01.calibration_results,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  NI_MCIT_M_01: NI_MCIT_M_01[]

  @Column('jsonb', { nullable: true })
  results?: IResults_NI_MCIT_M_01[]
}

export interface IResults_NI_MCIT_M_01 {
  point_number: number

  code: string
  accuracy_class: string
  mass: string
  nominal_mass: number
  calibrated_material: string
  balance: string
  thermometer: string

  patterns: string[]

  calibrations: {
    l1: number[]
    l2: number[]
    l3: number[]
    l4: number[]
  }
}
