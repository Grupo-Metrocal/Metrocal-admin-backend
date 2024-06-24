import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { GENERIC_METHOD } from "../GENERIC_METHOD.entity";

@Entity('equipment_information_GENERIC_METHOD')
export class EquipmentInformationGENERIC_METHOD {
  // Add your columns here
  @PrimaryGeneratedColumn('increment')
    id?: number
    // Add your columns here
    @ManyToOne(
        () => GENERIC_METHOD,
        (GENERIC_METHOD) => GENERIC_METHOD.equipment_information,
        {
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
      )
    GENERIC_METHOD: GENERIC_METHOD
    
    @Column({ type: 'date', nullable: true })
    date?: Date

    @Column({ type: 'varchar', nullable: true })
    device?: string

    @Column({ type: 'varchar', nullable: true })
    maker?: string

    @Column({ type: 'varchar', nullable: true })
    serial_number?: string

    @Column({ type: 'varchar', nullable: true })
    model?: string

    @Column({ type: 'varchar', nullable: true })
    measurement_range?: string

    @Column({ type: 'varchar', nullable: true })
    scale_interval?: string

    @Column({ type: 'varchar', nullable: true })
    code?: string

    @Column({ type: 'varchar', nullable: true })
    length?: string

    @Column({ type: 'varchar', nullable: true })
    estabilization_site?: string

}