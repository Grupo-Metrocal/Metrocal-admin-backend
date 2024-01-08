import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm'
import { NI_MCIT_P_01 } from '../NI_MCIT_P_01.entity'

@Entity('environmental_conditions_NI_MCIT_P_01')
export class EnvironmentalConditionsNI_MCIT_P_01 {
  @PrimaryGeneratedColumn('increment')
  id: number

  @OneToMany(
    () => NI_MCIT_P_01,
    (NI_MCIT_P_01) => NI_MCIT_P_01.environmental_conditions,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  NI_MCIT_P_01: NI_MCIT_P_01[]

  @Column('jsonb', { nullable: true })
  cycles?: ICycles_NI_MCIT_P_01[]
}

export interface ICycles_NI_MCIT_P_01 {
  cicles: number
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
  hPa: {
    pa: {
      initial: number
      final: number
    }
    equipement: string
  }
}
