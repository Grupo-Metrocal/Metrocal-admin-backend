import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm'
import { NI_MCIT_T_03 } from '../NI_MCIT_T_03.entity'

@Entity('description_pattern_NI_MCIT_T_03')
export class DescriptionPatternNI_MCIT_T_03 {
  @PrimaryGeneratedColumn('increment')
  id: number

  @OneToMany(
    () => NI_MCIT_T_03,
    (NI_MCIT_T_03) => NI_MCIT_T_03.description_pattern,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  NI_MCIT_T_03: NI_MCIT_T_03[]

  @Column({ nullable: true })
  pattern?: string

  @Column({ nullable: true })
  observation?: string

  @Column({ nullable: true })
  creditable?: boolean

  @Column({ nullable: true })
  next_calibration: string
}
