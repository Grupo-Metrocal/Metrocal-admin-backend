import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { NI_MCIT_D_01 } from '../NI_MCIT_D_01.entity'

@Entity('environmental_conditions_NI_MCIT_D_01')
export class EnvironmentalConditionsNI_MCIT_D_01 {
  @PrimaryGeneratedColumn('increment')
  id: number

  @ManyToOne(
    () => NI_MCIT_D_01,
    (NI_MCIT_D_01) => NI_MCIT_D_01.environmental_conditions,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  NI_MCIT_D_01: NI_MCIT_D_01

  @Column('jsonb', { nullable: true })
  cycles?: ICycles_NI_MCIT_D_01

  @Column({ nullable: true })
  equipment_used?: string

  @Column('jsonb', { nullable: true })
  time?: ITime_NI_MCIT_D_01

  @Column({ nullable: true })
  stabilization_site?: string
}

interface ICycles_NI_MCIT_D_01 {
  ta: {
    initial: number
    end: number
  }
  hr: {
    initial: number
    end: number
  }
}

interface ITime_NI_MCIT_D_01 {
  minute: number
}
