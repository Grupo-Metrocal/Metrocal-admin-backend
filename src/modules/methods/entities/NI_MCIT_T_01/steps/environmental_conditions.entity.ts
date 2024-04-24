import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm'
import { NI_MCIT_T_01 } from '../NI_MCIT_T_01.entity'

@Entity('environmental_conditions_NI_MCIT_T_01')
export class EnvironmentalConditionsNI_MCIT_T_01 {
  @PrimaryGeneratedColumn('increment')
  id: number

  @OneToMany(
    () => NI_MCIT_T_01,
    (NI_MCIT_P_01) => NI_MCIT_P_01.environmental_conditions,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  NI_MCIT_T_01: NI_MCIT_T_01[]

  @Column('jsonb', { nullable: true })
  environment?: ICycles_NI_MCIT_T_01
}

export interface ICycles_NI_MCIT_T_01 {
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
  hpa: {
    pa: {
      initial: number
      final: number
    }
    stabilization_time: number
    equipement: string
  }
}

// example
/* 
"environment": {
        "ta": {
          "tac": {
            "initial": 22.3,
            "final": 24.3
          },
          "hrp": {
            "initial": 56.2,
            "final": 57.8
          },
          "equipment": "NI-MCPPT-06"
        },
        "hpa": {
          "pa": {
            "initial": 1001,
            "final": 1001
          },
          "stabilization_time": 0,
          "equipement": "NI-MCPPT-06"
        }
      },
**/
