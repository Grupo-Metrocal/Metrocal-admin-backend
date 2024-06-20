import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { EquipmentInformationGENERIC_METHOD } from "./steps/equipment_information.entity";

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
  
    @Column({ nullable: true })
    certificate_url?: string
  
    @Column({ nullable: true, type: 'boolean', default: false })
    review_state?: boolean
  
    @Column({ nullable: true })
    review_user_id?: number

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

}