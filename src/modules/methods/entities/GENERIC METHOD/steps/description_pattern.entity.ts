import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm'
import { GENERIC_METHOD } from '../GENERIC_METHOD.entity'

@Entity('description_pattern_GENERIC_METHOD')
export class DescriptionPatternGENERIC_METHOD {
  @PrimaryGeneratedColumn('increment')
  id: number

  @OneToMany(
    () => GENERIC_METHOD,
    (GENERIC_METHOD) => GENERIC_METHOD.description_pattern,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  GENERIC_METHOD: GENERIC_METHOD[]

  @Column({ nullable: true })
  observation?: string

  @Column({ nullable: true })
  creditable?: boolean

  @Column({ nullable: true })
  next_calibration: string

  @Column({ nullable: true })
  calibration_date: string

  @Column('text', { array: true, nullable: true })
  patterns?: string[]
}
