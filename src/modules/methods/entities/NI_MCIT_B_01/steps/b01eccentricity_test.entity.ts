import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { NI_MCIT_B_01 } from '../NI_MCIT_B_01.entity'

@Entity('eccentricity_test_NI_MCIT_B_01')
export class EccentricityTestNI_MCIT_B_01 {
  @PrimaryGeneratedColumn('increment')
  id: number

  @ManyToOne(
    () => NI_MCIT_B_01,
    (NI_MCIT_B_01) => NI_MCIT_B_01.eccentricity_test,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  NI_MCIT_B_01: NI_MCIT_B_01[]

  @Column({ nullable: true })
  pointNumber?: number

  @Column('jsonb', { nullable: true })
  eccentricity_test?: IEccentricityTest[]
}

interface IEccentricityTest {
  indicationIL: number
  noLoadInfdication: number
}
