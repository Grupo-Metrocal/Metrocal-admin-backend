import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { NI_MCIT_M_01 } from '../NI_MCIT_M_01.entity'

@Entity('equipment_information_NI_MCIT_M_01')
export class EquipmentInformationNI_MCIT_M_01 {
  @PrimaryGeneratedColumn()
  id: number

  @OneToMany(
    () => NI_MCIT_M_01,
    (NI_MCIT_M_01) => NI_MCIT_M_01.equipment_information,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  NI_MCIT_M_01: NI_MCIT_M_01[]

  @Column({ type: 'varchar', nullable: true })
  calibration_object?: string

  @Column({ type: 'varchar', nullable: true })
  maker?: string

  @Column({ type: 'varchar', nullable: true })
  model?: string

  @Column({ type: 'varchar', nullable: true })
  code?: string

  @Column({ nullable: true })
  maximum_capacity?: number
}
