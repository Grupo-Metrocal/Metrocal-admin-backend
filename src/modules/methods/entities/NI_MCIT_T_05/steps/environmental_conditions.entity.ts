import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm'
import { NI_MCIT_T_05 } from '../NI_MCIT_T_05.entity'

@Entity('environmental_conditions_NI_MCIT_T_05')
export class EnvironmentalConditionsNI_MCIT_T_05 {
  @PrimaryGeneratedColumn('increment')
  id: number

  @OneToMany(
    () => NI_MCIT_T_05,
    (NI_MCIT_T_05) => NI_MCIT_T_05.environmental_conditions,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  NI_MCIT_T_05: NI_MCIT_T_05[]

  @Column('jsonb', { nullable: true })
  points?: IPoints_NI_MCIT_T_05[]
}

export interface IPoints_NI_MCIT_T_05 {
  point_number: number

  temperature: {
    initial: number
    final: number
  }

  humidity: {
    initial: number
    final: number
  }
}
