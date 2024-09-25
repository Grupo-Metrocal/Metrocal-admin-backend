import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { NI_MCIT_B_01 } from '../NI_MCIT_B_01.entity'

@Entity('repeatability_test_NI_MCIT_B_01')
export class RepeatabilityTestNI_MCIT_B_01 {
  @PrimaryGeneratedColumn('increment')
  id: number

  @ManyToOne(
    () => NI_MCIT_B_01,
    (NI_MCIT_B_01) => NI_MCIT_B_01.repeatability_test,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  NI_MCIT_B_01: NI_MCIT_B_01

  @Column({ nullable: true })
  pointNumber?: number

  @Column('jsonb', { nullable: true })
  repeatability_test?: IRepeatabilityTest[]
}

interface IRepeatabilityTest {
  indicationIL: number
  noLoadInfdication: number
}
