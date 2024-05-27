import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { NI_MCIT_D_02 } from '../NI_MCIT_D_02.entity'

@Entity('instrument_zero_check_NI_MCIT_D_02')
export class InstrumentZeroCheckNI_MCIT_D_02 {
  @PrimaryGeneratedColumn('increment')
  id: number

  @OneToMany(
    () => NI_MCIT_D_02,
    (NI_MCIT_D_02) => NI_MCIT_D_02.instrument_zero_check,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  NI_MCIT_D_02: NI_MCIT_D_02[]

  @Column({ nullable: true })
  nominal_value?: number

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

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  x6?: number

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  x7?: number

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  x8?: number

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  x9?: number

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  x10?: number
}
