import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm'
import { NI_MCIT_P_01 } from '../NI_MCIT_P_01.entity'

@Entity('description_pattern_NI_MCIT_P_01')
export class DescriptionPatternNI_MCIT_P_01 {
  @PrimaryGeneratedColumn('increment')
  id: number

  @OneToMany(
    () => NI_MCIT_P_01,
    (NI_MCIT_P_01) => NI_MCIT_P_01.description_pattern,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  NI_MCIT_P_01: NI_MCIT_P_01[]

  @Column({ type: 'varchar', nullable: true })
  description?: string

  @Column({ type: 'float', nullable: true })
  ni_mcpp_1?: number

  @Column({ type: 'float', nullable: true })
  ni_mcpp_2?: number

  @Column({ type: 'float', nullable: true })
  ni_mcpp_3?: number

  @Column({ type: 'float', nullable: true })
  ni_mcpve?: number

  @Column({ nullable: true })
  observation?: string
}
