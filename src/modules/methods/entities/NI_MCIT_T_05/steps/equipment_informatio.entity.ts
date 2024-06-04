import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm'
import { NI_MCIT_T_05 } from '../NI_MCIT_T_05.entity'

@Entity('equipment_information_NI_MCIT_T_05')
export class EquipmentInformationNI_MCIT_T_05 {
  @PrimaryGeneratedColumn()
  id: number

  @OneToMany(
    () => NI_MCIT_T_05,
    (NI_MCIT_T_05) => NI_MCIT_T_05.equipment_information,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  NI_MCIT_T_05: NI_MCIT_T_05[]

  @Column({ type: 'varchar', nullable: true })
  device?: string

  @Column({ type: 'varchar', nullable: true })
  maker?: string

  @Column({ type: 'varchar', nullable: true })
  serial_number?: string

  @Column({ type: 'varchar', nullable: true })
  measurement_range?: string

  @Column({ type: 'float', nullable: true })
  temperature_min?: number

  @Column({ type: 'float', nullable: true })
  temperature_max?: number

  @Column({ type: 'varchar', nullable: true })
  unit?: string

  @Column({ type: 'varchar', nullable: true })
  model?: string

  @Column({ type: 'varchar', nullable: true })
  code?: string

  @Column({ type: 'float', nullable: true })
  resolution?: number
}
