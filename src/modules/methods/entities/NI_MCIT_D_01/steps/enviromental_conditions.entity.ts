import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm'
import { NI_MCIT_D_01 } from '../NI_MCIT_D_01.entity'

@Entity('environmental_conditions_NI_MCIT_D_01')
export class EnvironmentalConditionsNI_MCIT_D_01 {
  @PrimaryGeneratedColumn('increment')
  id: number

  @OneToMany(
    () => NI_MCIT_D_01,
    (NI_MCIT_D_01) => NI_MCIT_D_01.environmental_conditions,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  NI_MCIT_D_01: NI_MCIT_D_01[]
  
  @Column('jsonb', { nullable: true })
  environmental_conditions:EnvConditions_NI_MCIT_D_01[]
  

}

export interface EnvConditions_NI_MCIT_D_01 {
  ta: {
    tac: {
      initial: number
      final: number
    }
    hrp: {
      initial: number
      final: number
    }
    equipement: string
  }
  tos: {
    
    minutes: Date
    stabilization_place: string
  }
}