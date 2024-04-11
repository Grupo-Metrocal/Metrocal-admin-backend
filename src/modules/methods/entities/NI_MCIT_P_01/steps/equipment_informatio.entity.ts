import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm'
import { NI_MCIT_P_01 } from '../NI_MCIT_P_01.entity'

@Entity('equipment_information_NI_MCIT_P_01')
export class EquipmentInformationNI_MCIT_P_01 {
  @PrimaryGeneratedColumn()
  id: number

  @OneToMany(
    () => NI_MCIT_P_01,
    (NI_MCIT_P_01) => NI_MCIT_P_01.equipment_information,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  NI_MCIT_P_01: NI_MCIT_P_01[]

  @Column({ type: 'varchar', nullable: true })
  device?: string

  @Column({ type: 'varchar', nullable: true })
  maker?: string

  @Column({ type: 'varchar', nullable: true })
  serial_number?: string

  @Column({ type: 'varchar', nullable: true })
  measurement_range?: string

  @Column({ type: 'float', nullable: true })
  range_min?: number

  @Column({ type: 'float', nullable: true })
  range_max?: number

  @Column({ type: 'varchar', nullable: true })
  accuracy_class?: string

  @Column({ type: 'varchar', nullable: true })
  unit?: string

  @Column({ type: 'varchar', nullable: true })
  model?: string

  @Column({ type: 'varchar', nullable: true })
  code?: string

  @Column({ type: 'float', nullable: true })
  height_difference?: number

  @Column({ type: 'float', nullable: true })
  resolution?: number

  @Column({ type: 'float', nullable: true })
  scale?: number
}
