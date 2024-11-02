import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm'
import { NI_MCIT_T_05 } from '../NI_MCIT_T_05.entity'

@Entity('description_pattern_NI_MCIT_T_05')
export class DescriptionPatternNI_MCIT_T_05 {
  @PrimaryGeneratedColumn('increment')
  id: number

  @OneToMany(
    () => NI_MCIT_T_05,
    (NI_MCIT_T_05) => NI_MCIT_T_05.description_pattern,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  NI_MCIT_T_05: NI_MCIT_T_05[]

  @Column({ nullable: true })
  pattern?: string

  @Column({ nullable: true })
  observation?: string

  @Column({ nullable: true })
  creditable?: boolean

  @Column({ nullable: true })
  next_calibration: string

  @Column({ nullable: true })
  calibration_date: string
}
