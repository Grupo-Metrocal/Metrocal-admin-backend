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

  @Column('jsonb', { nullable: true })
  measurements: IMeasurements[]
}

interface IMeasurements {
  point_number?: IPointNumber[]
  verification_lengths: IPlace
}

interface IPointNumber {
  point: String
}

interface IPlace {
  Exterior: IMedition
  Interior: IMedition
}

interface IMedition {
  x1: number
  x2: number
  x3: number
  x4: number
  x5: number
}
