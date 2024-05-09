import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm'
import { EquipmentInformationNI_MCIT_M_01 } from './steps/equipment_information.entity'
import { DataNI_MCIT_M_01 } from './steps/data.entity'

@Entity('NI_MCIT_M_01')
export class NI_MCIT_M_01 {
  @PrimaryGeneratedColumn('increment')
  id: number

  @Column({ nullable: true })
  calibration_location?: string

  @Column({ nullable: true, default: false, type: 'boolean' })
  report_status?: boolean

  @Column({ nullable: true, type: 'varchar', array: true, default: [] })
  report_messages?: string[]

  @Column({ nullable: true, default: 'pending' })
  status?: string // pending, done

  @Column({ nullable: true })
  certificate_id?: string

  @Column({ nullable: true })
  certificate_code?: string

  @Column({ nullable: true })
  certificate_url?: string

  @Column({ nullable: true, type: 'boolean', default: false })
  review_state?: boolean

  @Column({ nullable: true })
  review_user_id?: number

  @ManyToOne(
    () => EquipmentInformationNI_MCIT_M_01,
    (equipmentInformationNI_MCIT_M_01) =>
      equipmentInformationNI_MCIT_M_01.NI_MCIT_M_01,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  equipment_information: EquipmentInformationNI_MCIT_M_01

  @ManyToOne(
    () => DataNI_MCIT_M_01,
    (dataNI_MCIT_M_01) => dataNI_MCIT_M_01.NI_MCIT_M_01,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  data: DataNI_MCIT_M_01

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date
}
