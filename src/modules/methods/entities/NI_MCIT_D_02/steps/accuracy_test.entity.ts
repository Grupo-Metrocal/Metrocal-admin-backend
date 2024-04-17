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

  @Column('jsonb', { nullable: true })
  measure?: IMeasure[]
}

interface IMeasure {
  nominal_value: IPointNumber[]
  varification_lengths: IMedition
}

interface IPointNumber {
  point: string
}

interface IMedition {
  x1: number
  x2: number
  x3: number
  x4: number
  x5: number
  x6: number
  x7: number
  x8: number
  x9: number
  x10: number
}
