import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm'
import { EquipmentInformationNI_MCIT_D_01 } from './steps/equipment_informatio.entity'
import { EnvironmentalConditionsNI_MCIT_D_01 } from './steps/environmental_conditions.entity'
import { DescriptionPatternNI_MCIT_D_01 } from './steps/description_pattern.entity'
import { PreInstallationCommentNI_MCIT_D_01 } from './steps/pre_installation_comment.entity'
import { InstrumentZeroCheckNI_MCIT_D_01 } from './steps/instrument_zero_check.entity'
import { ExteriorParallelismMeasurementNI_MCIT_D_01 } from './steps/exterior_parallelism_measurement.entity'
import { InteriorParallelismMeasurementNI_MCIT_D_01 } from './steps/interior_parallelism_measurement.entity'
import { ExteriorMeasurementAccuracyNI_MCIT_D_01 } from './steps/exterior_measurement_accuracy.entity'

@Entity('NI_MCIT_D_01')
export class NI_MCIT_D_01 {
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

  @Column({ nullable: true, default: 'pending' })
  status?: string // pending, done

  @Column({ nullable: true, type: 'varchar', array: true, default: [] })
  report_messages?: string[]

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
    () => EquipmentInformationNI_MCIT_D_01,
    (equipmentInformationNI_MCIT_D_01) =>
      equipmentInformationNI_MCIT_D_01.NI_MCIT_D_01,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  equipment_information: EquipmentInformationNI_MCIT_D_01

  @ManyToOne(
    () => EnvironmentalConditionsNI_MCIT_D_01,
    (environmentalConditionsNI_MCIT_D_01) =>
      environmentalConditionsNI_MCIT_D_01.NI_MCIT_D_01,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  environmental_conditions: EnvironmentalConditionsNI_MCIT_D_01

  @ManyToOne(
    () => DescriptionPatternNI_MCIT_D_01,
    (descriptionPatternNI_MCIT_D_01) =>
      descriptionPatternNI_MCIT_D_01.NI_MCIT_D_01,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  description_pattern: DescriptionPatternNI_MCIT_D_01

  @ManyToOne(
    () => PreInstallationCommentNI_MCIT_D_01,
    (preInstallationCommentNI_MCIT_D_01) =>
      preInstallationCommentNI_MCIT_D_01.NI_MCIT_D_01,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  pre_installation_comment: PreInstallationCommentNI_MCIT_D_01

  @ManyToOne(
    () => InstrumentZeroCheckNI_MCIT_D_01,
    (instrumentZeroCheckNI_MCIT_D_01) =>
      instrumentZeroCheckNI_MCIT_D_01.NI_MCIT_D_01,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  instrument_zero_check: InstrumentZeroCheckNI_MCIT_D_01

  @ManyToOne(
    () => ExteriorParallelismMeasurementNI_MCIT_D_01,
    (exteriorParallelismMeasurementNI_MCIT_D_01) =>
      exteriorParallelismMeasurementNI_MCIT_D_01.NI_MCIT_D_01,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  exterior_parallelism_measurement: ExteriorParallelismMeasurementNI_MCIT_D_01

  @ManyToOne(
    () => InteriorParallelismMeasurementNI_MCIT_D_01,
    (interiorParallelismMeasurementNI_MCIT_D_01) =>
      interiorParallelismMeasurementNI_MCIT_D_01.NI_MCIT_D_01,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: true,
    },
  )
  interior_parallelism_measurement: InteriorParallelismMeasurementNI_MCIT_D_01

  @ManyToOne(
    () => ExteriorMeasurementAccuracyNI_MCIT_D_01,
    (exterior_measurement_accuracyNI_MCIT_D_01) =>
      exterior_measurement_accuracyNI_MCIT_D_01.NI_MCIT_D_01,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: true,
    },
  )
  exterior_measurement_accuracy: ExteriorMeasurementAccuracyNI_MCIT_D_01

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date
}
