import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { EquipmentInformationNI_MCIT_B_01 } from './steps/b01equipment_information.entity'
import { EnvironmentalConditionsNI_MCIT_B_01 } from './steps/b01enviromental_condition.entity'
import { LinearityTestNI_MCIT_B_01 } from './steps/b01linearity_test.entity'
import { RepeatabilityTestNI_MCIT_B_01 } from './steps/b01repeatability_test.entity'
import { EccentricityTestNI_MCIT_B_01 } from './steps/b01eccentricity_test.entity'
import { UnitOfMeasurementNI_MCIT_B_01 } from './steps/b01unitOfMeasurement.entity'

@Entity('NI_MCIT_B_01')
export class NI_MCIT_B_01 {
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

  @Column({ nullable: true, default: 'asterisks' })
  optionsCMCOnCertificate?: 'asterisks' | 'change_values'

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
    () => EquipmentInformationNI_MCIT_B_01,
    (equipmentInformationNI_MCIT_B_01) =>
      equipmentInformationNI_MCIT_B_01.NI_MCIT_B_01,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  equipment_information: EquipmentInformationNI_MCIT_B_01

  @ManyToOne(
    () => EnvironmentalConditionsNI_MCIT_B_01,
    (environmentalConditionsNI_MCIT_B_01) =>
      environmentalConditionsNI_MCIT_B_01.NI_MCIT_B_01,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  environmental_conditions: EnvironmentalConditionsNI_MCIT_B_01

  @ManyToOne(
    () => LinearityTestNI_MCIT_B_01,
    (linearityTestNI_MCIT_B_01) => linearityTestNI_MCIT_B_01.NI_MCIT_B_01,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  linearity_test: LinearityTestNI_MCIT_B_01

  @ManyToOne(
    () => RepeatabilityTestNI_MCIT_B_01,
    (repeatabilityTestNI_MCIT_B_01) =>
      repeatabilityTestNI_MCIT_B_01.NI_MCIT_B_01,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  repeatability_test: RepeatabilityTestNI_MCIT_B_01

  @ManyToOne(
    () => EccentricityTestNI_MCIT_B_01,
    (eccentricityTestNI_MCIT_B_01) => eccentricityTestNI_MCIT_B_01.NI_MCIT_B_01,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  eccentricity_test: EccentricityTestNI_MCIT_B_01

  //unidad de medida
  @ManyToOne(
    () => UnitOfMeasurementNI_MCIT_B_01,
    (unitOfMeasurement) => unitOfMeasurement.NI_MCIT_B_01,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  unit_of_measurement: UnitOfMeasurementNI_MCIT_B_01

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date
}
