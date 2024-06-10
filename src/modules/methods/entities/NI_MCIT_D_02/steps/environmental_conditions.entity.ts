import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { NI_MCIT_D_02 } from '../NI_MCIT_D_02.entity'

@Entity('environmental_conditions_NI_MCIT_D_02')
export class EnvironmentalConditionsNI_MCIT_D_02 {
  @PrimaryGeneratedColumn('increment')
  id: number

  @ManyToOne(
    () => NI_MCIT_D_02,
    (NI_MCIT_D_02) => NI_MCIT_D_02.environmental_conditions,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  NI_MCIT_D_02: NI_MCIT_D_02

  @Column('jsonb', { nullable: true })
  cycles?: ICycles_NI_MCIT_D_02

  @Column({ nullable: true })
  equipment_used?: string

  @Column('jsonb', { nullable: true })
  time?: ITime_NI_MCIT_D_02

  @Column({ nullable: true })
  stabilization_site?: string
}

interface ICycles_NI_MCIT_D_02 {
  ta: {
    initial: number
    end: number
  }
  hr: {
    initial: number
    end: number
  }
}

interface ITime_NI_MCIT_D_02 {
  hour: number
  minute: number
}
