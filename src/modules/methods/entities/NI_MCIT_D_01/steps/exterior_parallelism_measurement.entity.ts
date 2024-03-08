import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { NI_MCIT_D_01 } from '../NI_MCIT_D_01.entity'

@Entity('exterior_parallelism_measurement_NI_MCIT_D_01')
export class ExteriorParallelismMeasurementNI_MCIT_D_01 {
  @PrimaryGeneratedColumn('increment')
  id: number

  @OneToMany(
    () => NI_MCIT_D_01,
    (NI_MCIT_D_01) => NI_MCIT_D_01.exterior_parallelism_measurement,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  NI_MCIT_D_01: NI_MCIT_D_01[]

  @Column({ nullable: true })
  point_number?: number

  @Column('jsonb', { nullable: true })
  x1?: IMeasurements_NI_MCIT_D_01

  @Column('jsonb', { nullable: true })
  x2?: IMeasurements_NI_MCIT_D_01

  @Column('jsonb', { nullable: true })
  x3?: IMeasurements_NI_MCIT_D_01

  @Column('jsonb', { nullable: true })
  x4?: IMeasurements_NI_MCIT_D_01

  @Column('jsonb', { nullable: true })
  x5?: IMeasurements_NI_MCIT_D_01
}

interface IMeasurements_NI_MCIT_D_01 {
  exterior: number
  interior: number
}
