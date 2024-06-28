import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { EnvironmentalConditionsNI_MCIT_D_02 } from './steps/d02environmental_conditions.entity'
import { EquipmentInformationNI_MCIT_D_02 } from './steps/d02equipment_informatio.entity'
import { DescriptionPatternNI_MCIT_D_02 } from './steps/d02description_pattern.entity'
import { PreInstallationCommentNI_MCIT_D_02 } from './steps/d02pre_installation_comment.entity'
import { InstrumentZeroCheckNI_MCIT_D_02 } from './steps/d02instrument_zero_check.entity'
import { AccuracyTestNI_MCIT_D_02 } from './steps/d02accuracy_test.entity'

@Entity('NI_MCIT_D_02')
export class NI_MCIT_D_02 {
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

  @Column({ nullable: true, default: false, type: 'boolean' })
  report_status?: boolean

  @Column({ nullable: true, type: 'varchar', array: true, default: [] })
  report_messages?: string[]

  @ManyToOne(
    () => EquipmentInformationNI_MCIT_D_02,
    (equipmentInformationNI_MCIT_D_02) =>
      equipmentInformationNI_MCIT_D_02.NI_MCIT_D_02,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  equipment_information: EquipmentInformationNI_MCIT_D_02

  @ManyToOne(
    () => EnvironmentalConditionsNI_MCIT_D_02,
    (environmentalConditionsNI_MCIT_D_02) =>
      environmentalConditionsNI_MCIT_D_02.NI_MCIT_D_02,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  environmental_conditions: EnvironmentalConditionsNI_MCIT_D_02

  @ManyToOne(
    () => DescriptionPatternNI_MCIT_D_02,
    (descriptionPatternNI_MCIT_D_02) =>
      descriptionPatternNI_MCIT_D_02.NI_MCIT_D_02,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  description_pattern: DescriptionPatternNI_MCIT_D_02

  @ManyToOne(
    () => PreInstallationCommentNI_MCIT_D_02,
    (preInstallationCommentNI_MCIT_D_02) =>
      preInstallationCommentNI_MCIT_D_02.NI_MCIT_D_02,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @ManyToOne(
    () => PreInstallationCommentNI_MCIT_D_02,
    (preInstallationCommentNI_MCIT_D_02) =>
      preInstallationCommentNI_MCIT_D_02.NI_MCIT_D_02,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  pre_installation_comment: PreInstallationCommentNI_MCIT_D_02

  @ManyToOne(
    () => InstrumentZeroCheckNI_MCIT_D_02,
    (instrumentZeroCheckNI_MCIT_D_02) =>
      instrumentZeroCheckNI_MCIT_D_02.NI_MCIT_D_02,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  instrument_zero_check: InstrumentZeroCheckNI_MCIT_D_02

  @ManyToOne(
    () => AccuracyTestNI_MCIT_D_02,
    (accuracyTestNI_MCIT_D_02) => accuracyTestNI_MCIT_D_02.NI_MCIT_D_02,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  accuracy_test: AccuracyTestNI_MCIT_D_02

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date

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

  @Column({ nullable: true, default: 'pending' })
  status?: string // pending, done
}
