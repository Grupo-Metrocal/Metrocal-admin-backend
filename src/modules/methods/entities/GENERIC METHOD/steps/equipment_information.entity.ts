import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { GENERIC_METHOD } from '../GENERIC_METHOD.entity'

@Entity('equipment_information_GENERIC_METHOD')
export class EquipmentInformationGENERIC_METHOD {
  @PrimaryGeneratedColumn('increment')
  id: number

  @ManyToOne(
    () => GENERIC_METHOD,
    (GENERIC_METHOD) => GENERIC_METHOD.equipment_information,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  GENERIC_METHOD: GENERIC_METHOD

  @Column({ type: 'varchar', nullable: true })
  device?: string

  @Column({ type: 'varchar', nullable: true })
  maker?: string

  @Column({ type: 'varchar', nullable: true })
  serial_number?: string

  @Column({ type: 'varchar', nullable: true })
  model?: string

  @Column({ type: 'float', nullable: true })
  range_min?: number

  @Column({ type: 'float', nullable: true })
  range_max?: number

  @Column({ type: 'float', nullable: true })
  scale_interval?: number

  @Column({ type: 'varchar', nullable: true })
  code?: string

  @Column({ type: 'varchar', nullable: true })
  estabilization_site?: string
}
