import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm'
import { NI_MCIT_M_01 } from '../NI_MCIT_M_01.entity'

@Entity('environmental_conditions_NI_MCIT_M_01')
export class EnvironmentalConditionsNI_MCIT_M_01 {
  @PrimaryGeneratedColumn('increment')
  id: number

  @OneToMany(
    () => NI_MCIT_M_01,
    (NI_MCIT_M_01) => NI_MCIT_M_01.environmental_conditions,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  NI_MCIT_M_01: NI_MCIT_M_01[]

  @Column('jsonb', { nullable: true })
  points?: IPoints_NI_MCIT_M_01[]
}

export interface IPoints_NI_MCIT_M_01 {
  point_number: number
  temperature: IConditions
  humidity: IConditions
  presion: IConditions
}

interface IConditions {
  initial: number
  final: number
  resolution: number
}

