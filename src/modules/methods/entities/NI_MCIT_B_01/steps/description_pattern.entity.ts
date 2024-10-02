import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm'
import { NI_MCIT_B_01 } from '../NI_MCIT_B_01.entity'

@Entity('description_pattern_NI_MCIT_B_01')
export class DescriptionPatternNI_MCIT_B_01 {
  @PrimaryGeneratedColumn('increment')
  id: number

  @OneToMany(
    () => NI_MCIT_B_01,
    (NI_MCIT_B_01) => NI_MCIT_B_01.description_pattern,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  NI_MCIT_B_01: NI_MCIT_B_01[]

  @Column({ nullable: true })
  observation?: string

  @Column({ nullable: true })
  creditable?: boolean

  @Column({ default: '' })
  show_additional_table: 'lb' | 'kg' | ''

  @Column({ nullable: true })
  next_calibration: string
}
