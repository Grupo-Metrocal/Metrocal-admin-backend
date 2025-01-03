import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { EquipmentInformationGENERIC_METHOD } from './steps/equipment_information.entity'
import { EnvironmentalConditionsGENERIC_METHOD } from './steps/enviromental_condition.entity'
import { ComputerDataGENERIC_METHOD } from './steps/computer_data.entity'
import { ResultMeditionGENERIC_METHOD } from './steps/result_medition.entity'
import { DescriptionPatternGENERIC_METHOD } from './steps/description_pattern.entity'

@Entity('GENERIC_METHOD')
export class GENERIC_METHOD {
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

  @Column({ default: 0 })
  last_record_index: number

  @ManyToOne(
    () => EquipmentInformationGENERIC_METHOD,
    (equipmentInformationGENERIC_METHOD) =>
      equipmentInformationGENERIC_METHOD.GENERIC_METHOD,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  equipment_information: EquipmentInformationGENERIC_METHOD

  @ManyToOne(
    () => EnvironmentalConditionsGENERIC_METHOD,
    (environmentalConditionsGENERIC_METHOD) =>
      environmentalConditionsGENERIC_METHOD.GENERIC_METHOD,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  environmental_conditions: EnvironmentalConditionsGENERIC_METHOD

  @ManyToOne(
    () => ComputerDataGENERIC_METHOD,
    (computerDataGENERIC_METHOD) => computerDataGENERIC_METHOD.GENERIC_METHOD,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  computer_data: ComputerDataGENERIC_METHOD

  @ManyToOne(
    () => ResultMeditionGENERIC_METHOD,
    (resultMeditionGENERIC_METHOD) =>
      resultMeditionGENERIC_METHOD.GENERIC_METHOD,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  result_medition: ResultMeditionGENERIC_METHOD

  @ManyToOne(
    () => DescriptionPatternGENERIC_METHOD,
    (DescriptionPatternGENERIC_METHOD) =>
      DescriptionPatternGENERIC_METHOD.GENERIC_METHOD,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  description_pattern: DescriptionPatternGENERIC_METHOD

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date
}
