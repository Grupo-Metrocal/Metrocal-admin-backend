import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm'
import { EquipmentInformationNI_MCIT_T_05 } from './steps/equipment_informatio.entity'
import { DescriptionPatternNI_MCIT_T_05 } from './steps/description_pattern.entity'
import { CalibrationResultsNI_MCIT_T_05 } from './steps/calibration_results.entity'
import { EnvironmentalConditionsNI_MCIT_T_05 } from './steps/environmental_conditions.entity'

@Entity('NI_MCIT_T_05')
export class NI_MCIT_T_05 {
  @PrimaryGeneratedColumn('increment')
  id: number

  @Column({ nullable: true })
  calibration_location?: string

  @Column({ nullable: true })
  applicant_address?: string

  @Column({ nullable: true })
  applicant_name: string

  @Column({ nullable: true })
  modification_number?: number

  @Column({ nullable: true })
  method_end_date_finished: Date

  @Column({ nullable: true })
  certificate_issue_date: Date

  @Column({ nullable: true, default: 'asterisks' })
  optionsCMCOnCertificate?: 'asterisks' | 'change_values'

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

  @Column({ default: 0 })
  record_index: number

  @ManyToOne(
    () => EquipmentInformationNI_MCIT_T_05,
    (EquipmentInformationNI_MCIT_T_05) =>
      EquipmentInformationNI_MCIT_T_05.NI_MCIT_T_05,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  equipment_information: EquipmentInformationNI_MCIT_T_05

  @ManyToOne(
    () => DescriptionPatternNI_MCIT_T_05,
    (DescriptionPatternNI_MCIT_T_05) =>
      DescriptionPatternNI_MCIT_T_05.NI_MCIT_T_05,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  description_pattern: DescriptionPatternNI_MCIT_T_05

  @ManyToOne(
    () => CalibrationResultsNI_MCIT_T_05,
    (CalibrationResultsNI_MCIT_T_05) =>
      CalibrationResultsNI_MCIT_T_05.NI_MCIT_T_05,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  calibration_results: CalibrationResultsNI_MCIT_T_05

  @ManyToOne(
    () => EnvironmentalConditionsNI_MCIT_T_05,
    (EnvironmentalConditionsNI_MCIT_T_05) =>
      EnvironmentalConditionsNI_MCIT_T_05.NI_MCIT_T_05,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  environmental_conditions: EnvironmentalConditionsNI_MCIT_T_05

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date
}
