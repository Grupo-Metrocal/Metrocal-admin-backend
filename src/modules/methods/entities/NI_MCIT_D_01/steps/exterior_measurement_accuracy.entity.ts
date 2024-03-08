import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { NI_MCIT_D_01 } from '../NI_MCIT_D_01.entity'

@Entity('exterior_measurement_accuracy_NI_MCIT_D_01')
export class ExteriorMeasurementAccuracyNI_MCIT_D_01 {
  @PrimaryGeneratedColumn('increment')
  id: number

  @OneToMany(
    () => NI_MCIT_D_01,
    (NI_MCIT_D_01) => NI_MCIT_D_01.exterior_measurement_accuracy,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  NI_MCIT_D_01: NI_MCIT_D_01[]

  @Column({ nullable: true })
  nominal_patron_value?: number

  @Column('jsonb', { nullable: true })
  measure?: IMeasure[]
}

interface IMeasure {
  x1: number
  x2: number
  x3: number
  x4: number
  x5: number
}
