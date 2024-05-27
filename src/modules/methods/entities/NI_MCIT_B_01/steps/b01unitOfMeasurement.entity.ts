import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { NI_MCIT_B_01 } from '../NI_MCIT_B_01.entity'

@Entity('unit_of_measurement_NI_MCIT_B_01')
export class UnitOfMeasurementNI_MCIT_B_01 {
  @PrimaryGeneratedColumn('increment')
  id: number

  @ManyToOne(
    () => NI_MCIT_B_01,
    (NI_MCIT_B_01) => NI_MCIT_B_01.unit_of_measurement,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  NI_MCIT_B_01: NI_MCIT_B_01[]

  //medida
  @Column({ nullable: true })
  measure?: string

  //resolution decimal
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  resolution?: number
}
