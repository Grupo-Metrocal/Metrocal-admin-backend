import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm'
import { EquipmentInformationNI_MCIT_P_01 } from './steps/equipment_informatio.entity'
import { EnvironmentalConditionsNI_MCIT_P_01 } from './steps/environmental_conditions.entity'
import { CalibrationResultsNI_MCIT_P_01 } from './steps/calibration_results.entity'
import { DescriptionPatternNI_MCIT_P_01 } from './steps/description_pattern.entity'

@Entity('NI_MCIT_P_01')
export class NI_MCIT_P_01 {
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

  @ManyToOne(
    () => EquipmentInformationNI_MCIT_P_01,
    (EquipmentInformationNI_MCIT_P_01) =>
      EquipmentInformationNI_MCIT_P_01.NI_MCIT_P_01,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  equipment_information: EquipmentInformationNI_MCIT_P_01

  @ManyToOne(
    () => EnvironmentalConditionsNI_MCIT_P_01,
    (EnvironmentalConditionsNI_MCIT_P_01) =>
      EnvironmentalConditionsNI_MCIT_P_01.NI_MCIT_P_01,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  environmental_conditions: EnvironmentalConditionsNI_MCIT_P_01

  @ManyToOne(
    () => CalibrationResultsNI_MCIT_P_01,
    (CalibrationResultsNI_MCIT_P_01) =>
      CalibrationResultsNI_MCIT_P_01.NI_MCIT_P_01,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  calibration_results: CalibrationResultsNI_MCIT_P_01

  @ManyToOne(
    () => DescriptionPatternNI_MCIT_P_01,
    (DescriptionPatternNI_MCIT_P_01) =>
      DescriptionPatternNI_MCIT_P_01.NI_MCIT_P_01,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  description_pattern: DescriptionPatternNI_MCIT_P_01

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date
}
