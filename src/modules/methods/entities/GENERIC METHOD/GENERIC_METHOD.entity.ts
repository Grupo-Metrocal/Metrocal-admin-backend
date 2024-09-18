import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { EquipmentInformationGENERIC_METHOD } from './steps/equipment_information.entity'
import { EnvironmentalConditionsGENERIC_METHOD } from './steps/enviromental_condition.entity'
import { ComputerDataGENERIC_METHOD } from './steps/computer_data.entity'
import { ResultMeditionGENERIC_METHOD } from './steps/result_medition.entity'

@Entity('GENERIC_METHOD')
export class GENERIC_METHOD {
  // Add your columns here
  @PrimaryGeneratedColumn('increment')
  id: number

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

  @Column({ nullable: true, default: 'asterisks' })
  optionsCMCOnCertificate?: 'asterisks' | 'change_values'

  @Column({ nullable: true })
  certificate_url?: string

  @Column({ nullable: true, type: 'boolean', default: false })
  review_state?: boolean

  @Column({ nullable: true })
  review_user_id?: number

  @Column({ nullable: true })
  modification_number?: number

  @Column({ default: 0 })
  record_index: number

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
}
