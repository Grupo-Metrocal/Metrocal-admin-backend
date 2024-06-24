import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { GENERIC_METHOD } from "../GENERIC_METHOD.entity";

@Entity('environmental_conditions_GENERIC_METHOD')
export class EnvironmentalConditionsGENERIC_METHOD {
  // Add your columns here
    @PrimaryGeneratedColumn('increment')
    id: number

    // Add your columns here
    @ManyToOne(
        () => GENERIC_METHOD,
        (GENERIC_METHOD) => GENERIC_METHOD.environmental_conditions,
        {
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
      )

    GENERIC_METHOD: GENERIC_METHOD

    @Column({ type: 'varchar', nullable: true })
    temperature?: number

    @Column({ type: 'varchar', nullable: true })
    hr?: number

    @Column({ type: 'varchar', nullable: true })
    equipment_used?: string
}
