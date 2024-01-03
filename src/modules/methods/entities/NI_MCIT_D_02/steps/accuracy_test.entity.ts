import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { NI_MCIT_D_02 } from '../NI_MCIT_D_02.entity'

@Entity('accuracy_test_NI_MCIT_D_02')
export class AccuracyTestNI_MCIT_D_02 {
  @PrimaryGeneratedColumn('increment')
  id: number

  @OneToMany(() => NI_MCIT_D_02, (NI_MCIT_D_02) => NI_MCIT_D_02.accuracy_test, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  NI_MCIT_D_02: NI_MCIT_D_02[]

  @Column({ nullable: true })
  nominal_value?: number

  @Column({ nullable: true })
  measure?: IMeasure[]
}

interface IMeasure {
  x1: number
  x2: number
  x3: number
  x4: number
  x5: number
}
