import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { NI_MCIT_B_01 } from '../NI_MCIT_B_01.entity'

@Entity('linearity_test_NI_MCIT_B_01')
export class LinearityTestNI_MCIT_B_01 {
  @PrimaryGeneratedColumn('increment')
  id: number

  @ManyToOne(
    () => NI_MCIT_B_01,
    (NI_MCIT_B_01) => NI_MCIT_B_01.linearity_test,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  NI_MCIT_B_01: NI_MCIT_B_01

  @Column('jsonb', { nullable: true })
  linearity_test?: ILinearityTest[]
}

interface ILinearityTest {
  point: number
  pointsComposition: IPointsComposition[]
  indicationIL: number
  noLoadInfdication: number
}

interface IPointsComposition {
  point: string
}
