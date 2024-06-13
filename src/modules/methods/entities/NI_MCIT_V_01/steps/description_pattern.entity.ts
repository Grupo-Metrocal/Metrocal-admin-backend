import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm'
import { NI_MCIT_V_01 } from '../NI_MCIT_V_01.entity'

@Entity('description_pattern_NI_MCIT_V_01')
export class DescriptionPatternNI_MCIT_V_01 {
  @PrimaryGeneratedColumn('increment')
  id: number

  @OneToMany(
    () => NI_MCIT_V_01,
    (NI_MCIT_V_01) => NI_MCIT_V_01.description_pattern,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  NI_MCIT_V_01: NI_MCIT_V_01[]

  @Column({ nullable: true })
  pattern?: string

  @Column({ nullable: true })
  observation?: string

  @Column({ nullable: true })
  creditable?: boolean
}
