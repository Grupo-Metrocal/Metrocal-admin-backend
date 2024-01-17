import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm'
import { NI_MCIT_D_01 } from '../NI_MCIT_D_01.entity'


@Entity('instrument_zero_check_NI_MCIT_D_01')
export class InstrumentZeroCheckNI_MCIT_D_01 {
  @PrimaryGeneratedColumn('increment')
  id: number
  @OneToMany(
    () => NI_MCIT_D_01,
    (NI_MCIT_P_01) => NI_MCIT_P_01.instrument_zero_check,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  NI_MCIT_D_01: NI_MCIT_D_01[]

  @Column('jsonb', { nullable: true })
  instrument_zero_check:InstrumentZero_NI_MCIT_D_01[]
}

export interface InstrumentZero_NI_MCIT_D_01 {
  nominal_value: {
    value:number
  }
  measurements: {
    x1:number
    x2:number
    x3:number
    x4:number
    x5:number
  }
}
