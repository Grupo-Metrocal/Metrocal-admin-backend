import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm'
import { NI_MCIT_D_01 } from '../NI_MCIT_D_01.entity'

@Entity('description_pattern_NI_MCIT_D_01')
export class DescriptionPatternNI_MCIT_D_01 {
  @PrimaryGeneratedColumn('increment')
  id: number

 @OneToMany(
    () => NI_MCIT_D_01,
    (NI_MCIT_P_01) => NI_MCIT_P_01.description_pattern,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  NI_MCIT_D_01: NI_MCIT_D_01[]

  @Column({ type: 'float', nullable: true })
  ni_mcpd_1?: number

  @Column({ type: 'float', nullable: true })
  ni_mcpd_2?: number

  @Column({ type: 'float', nullable: true })
  ni_mcpd_3?: number

  @Column({ type: 'float', nullable: true })
  ni_mcpd_4?: number
}
