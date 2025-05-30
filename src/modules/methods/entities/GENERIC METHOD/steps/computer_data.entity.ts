import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { GENERIC_METHOD } from '../GENERIC_METHOD.entity'

@Entity('computer_data_GENERIC_METHOD')
export class ComputerDataGENERIC_METHOD {
  @PrimaryGeneratedColumn('increment')
  id: number

  @ManyToOne(
    () => GENERIC_METHOD,
    (GENERIC_METHOD) => GENERIC_METHOD.computer_data,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  GENERIC_METHOD: GENERIC_METHOD

  @Column({ type: 'varchar', nullable: true })
  unit_of_measurement: string

  @Column({ type: 'float', nullable: true })
  scale_division: number
}
