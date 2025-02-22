import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm'
import { NI_MCIT_V_01 } from '../NI_MCIT_V_01.entity'

@Entity('environmental_conditions_NI_MCIT_V_01')
export class EnvironmentalConditionsNI_MCIT_V_01 {
  @PrimaryGeneratedColumn('increment')
  id: number

  @OneToMany(
    () => NI_MCIT_V_01,
    (NI_MCIT_V_01) => NI_MCIT_V_01.environmental_conditions,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  NI_MCIT_V_01: NI_MCIT_V_01[]

  @Column('jsonb', { nullable: true })
  points?: IPoints_NI_MCIT_V_01[]

  @Column({ nullable: true })
  pattern: string
}

export interface IPoints_NI_MCIT_V_01 {
  point_number: number
  temperature: IConditions
  humidity: IConditions
  presion_pa: IConditions
}

interface IConditions {
  initial: number
  final: number
  resolution: number
}
