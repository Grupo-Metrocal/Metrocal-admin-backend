import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { NI_MCIT_D_02 } from '../NI_MCIT_D_02.entity'

@Entity('description_pattern_NI_MCIT_D_02')
export class DescriptionPatternNI_MCIT_D_02 {
  @PrimaryGeneratedColumn('increment')
  id: number

  @OneToMany(
    () => NI_MCIT_D_02,
    (NI_MCIT_D_02) => NI_MCIT_D_02.description_pattern,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  NI_MCIT_D_02: NI_MCIT_D_02[]

  @Column('jsonb', { nullable: true })
  descriptionPattern: string[]

  @Column({ nullable: true })
  next_calibration: string
}
