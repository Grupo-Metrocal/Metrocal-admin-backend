import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { GENERIC_METHOD } from "../GENERIC_METHOD.entity";

@Entity('environmental_conditions_GENERIC_METHOD')
export class EnvironmentalConditionsGENERIC_METHOD {
  // Add your columns here
    @PrimaryGeneratedColumn('increment')
    id: number

    // Add your columns here
    GENERIC_METHOD: GENERIC_METHOD[]

    @Column({ type: 'varchar', nullable: true })
    temperature?: string

    @Column({ type: 'varchar', nullable: true })
    hr?: string

    @Column({ type: 'varchar', nullable: true })
    equipment_used?: string

    
}
