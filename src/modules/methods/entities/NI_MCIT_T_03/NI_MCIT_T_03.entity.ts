import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm'
import { EquipmentInformationNI_MCIT_T_03 } from './steps/equipment_informatio.entity'
import { DescriptionPatternNI_MCIT_T_03 } from './steps/description_pattern.entity'
import { CalibrationResultsNI_MCIT_T_03 } from './steps/calibration_results.entity'
import { EnvironmentalConditionsNI_MCIT_T_03 } from './steps/environmental_conditions.entity'

@Entity('NI_MCIT_T_03')
export class NI_MCIT_T_03 {
  @PrimaryGeneratedColumn('increment')
  id: number

  @Column({ nullable: true })
  calibration_location?: string

  @Column({ nullable: true })
  applicant_address?: string

  @Column({ nullable: true })
  applicant_name: string

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
    () => EquipmentInformationNI_MCIT_T_03,
    (EquipmentInformationNI_MCIT_T_03) =>
      EquipmentInformationNI_MCIT_T_03.NI_MCIT_T_03,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  equipment_information: EquipmentInformationNI_MCIT_T_03

  @ManyToOne(
    () => DescriptionPatternNI_MCIT_T_03,
    (DescriptionPatternNI_MCIT_T_03) =>
      DescriptionPatternNI_MCIT_T_03.NI_MCIT_T_03,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  description_pattern: DescriptionPatternNI_MCIT_T_03

  @ManyToOne(
    () => CalibrationResultsNI_MCIT_T_03,
    (CalibrationResultsNI_MCIT_T_03) =>
      CalibrationResultsNI_MCIT_T_03.NI_MCIT_T_03,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  calibration_results: CalibrationResultsNI_MCIT_T_03

  @ManyToOne(
    () => EnvironmentalConditionsNI_MCIT_T_03,
    (EnvironmentalConditionsNI_MCIT_T_03) =>
      EnvironmentalConditionsNI_MCIT_T_03.NI_MCIT_T_03,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  environmental_conditions: EnvironmentalConditionsNI_MCIT_T_03

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date
}
