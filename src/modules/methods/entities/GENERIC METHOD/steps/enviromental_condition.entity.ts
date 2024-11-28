import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { GENERIC_METHOD } from '../GENERIC_METHOD.entity'

@Entity('environmental_conditions_GENERIC_METHOD')
export class EnvironmentalConditionsGENERIC_METHOD {
  @PrimaryGeneratedColumn('increment')
  id: number

  @ManyToOne(
    () => GENERIC_METHOD,
    (GENERIC_METHOD) => GENERIC_METHOD.environmental_conditions,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  GENERIC_METHOD: GENERIC_METHOD

  @Column({ nullable: true })
  temperature?: number

  @Column({ nullable: true })
  hr?: number

  @Column({ type: 'varchar', nullable: true })
  pattern?: string
}
