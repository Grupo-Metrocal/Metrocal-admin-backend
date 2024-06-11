import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm'
import { NI_MCIT_T_01 } from '../NI_MCIT_T_01.entity'

@Entity('description_pattern_NI_MCIT_T_01')
export class DescriptionPatternNI_MCIT_T_01 {
  @PrimaryGeneratedColumn('increment')
  id: number

  @OneToMany(
    () => NI_MCIT_T_01,
    (NI_MCIT_P_01) => NI_MCIT_P_01.description_pattern,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  NI_MCIT_T_01: NI_MCIT_T_01[]

  @Column({ nullable: true })
  pattern?: string

  @Column({ nullable: true })
  observation?: string

  @Column({ nullable: true })
  creditable?: boolean

  @Column({ nullable: true })
  show_table_international_system_units?: boolean
}
