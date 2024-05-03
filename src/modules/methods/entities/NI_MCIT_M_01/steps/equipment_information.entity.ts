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
  certificate_id?: string

  @Column({ type: 'varchar', nullable: true })
  applicant?: string

  @Column({ type: 'varchar', nullable: true })
  calibration_object?: string

  @Column({ type: 'varchar', nullable: true })
  manofacturer_brand?: string

  @Column({ type: 'varchar', nullable: true })
  model?: string

  @Column({ type: 'varchar', nullable: true })
  address_applicant?: string

  @Column({ type: 'varchar', nullable: true })
  calibration_place?: string

  @Column({ type: 'varchar', nullable: true })
  calibration_date?: string

  @Column({ type: 'varchar', nullable: true })
  Service_code?: string
}
