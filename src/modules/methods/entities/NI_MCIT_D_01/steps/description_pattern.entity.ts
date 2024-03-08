import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { NI_MCIT_D_01 } from '../NI_MCIT_D_01.entity'

@Entity('description_pattern_NI_MCIT_D_01')
export class DescriptionPatternNI_MCIT_D_01 {
  @PrimaryGeneratedColumn('increment')
  id: number

  @OneToMany(
    () => NI_MCIT_D_01,
    (NI_MCIT_D_01) => NI_MCIT_D_01.description_pattern,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  NI_MCIT_D_01: NI_MCIT_D_01[]

  @Column({ nullable: true })
  NI_MCPD_01?: number

  @Column({ nullable: true })
  NI_MCPD_02?: number

  @Column({ nullable: true })
  NI_MCPD_03?: number

  @Column({ nullable: true })
  NI_MCPD_04?: number
}
