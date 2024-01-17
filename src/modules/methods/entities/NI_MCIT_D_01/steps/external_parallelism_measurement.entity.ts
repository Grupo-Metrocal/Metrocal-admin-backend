import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm'
import { NI_MCIT_D_01 } from '../NI_MCIT_D_01.entity'


@Entity('external_parallelism_measurement_NI_MCIT_D_01')
export class ExternalParallelismMeasurementNI_MCIT_D_01 {
  @PrimaryGeneratedColumn('increment')
  id: number

  @OneToMany(
    () => NI_MCIT_D_01,
    (NI_MCIT_P_01) => NI_MCIT_P_01.external_parallelism_measurement,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  NI_MCIT_D_01: NI_MCIT_D_01[]

  @Column('jsonb', { nullable: true })
  external_parallelism_measurement:Meditions_NI_MCIT_D_01[]
}

export interface Meditions_NI_MCIT_D_01 {
  inside: {
    x1:number
    x2:number
    x3:number
    x4:number
    x5:number 

  }
  aboard: {
    x1:number
    x2:number
    x3:number
    x4:number
    x5:number 
    
  }
}
