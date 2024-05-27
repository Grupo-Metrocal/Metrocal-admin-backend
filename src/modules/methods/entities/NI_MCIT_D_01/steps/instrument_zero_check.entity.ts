import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { NI_MCIT_D_01 } from '../NI_MCIT_D_01.entity'

@Entity('instrument_zero_check_NI_MCIT_D_01')
export class InstrumentZeroCheckNI_MCIT_D_01 {
  @PrimaryGeneratedColumn('increment')
  id: number

  @OneToMany(
    () => NI_MCIT_D_01,
    (NI_MCIT_D_01) => NI_MCIT_D_01.instrument_zero_check,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  NI_MCIT_D_01: NI_MCIT_D_01[]

  @Column({ nullable: true })
  nominal_value: number

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  x1?: number

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  x2?: number

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  x3?: number

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  x4?: number

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  x5?: number
}
