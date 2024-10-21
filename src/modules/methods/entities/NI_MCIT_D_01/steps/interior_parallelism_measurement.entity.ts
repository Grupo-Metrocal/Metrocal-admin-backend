import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { NI_MCIT_D_01 } from '../NI_MCIT_D_01.entity'

@Entity('interior_parallelism_measurement_NI_MCIT_D_01')
export class InteriorParallelismMeasurementNI_MCIT_D_01 {
  @PrimaryGeneratedColumn('increment')
  id: number

  @OneToMany(
    () => NI_MCIT_D_01,
    (NI_MCIT_D_01) => NI_MCIT_D_01.interior_parallelism_measurement,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  NI_MCIT_D_01: NI_MCIT_D_01[]

  @Column('jsonb', { nullable: true })
  measurementsd01?: IMeasurements[]
}

interface IMeasurements {
  point_number: string
  verification_lengths: IPlaces
}

interface IPlaces {
  Exterior: IMeditions
  Interior: IMeditions
}

interface IMeditions {
  x1: number
  x2: number
  x3: number
  x4: number
  x5: number
}
