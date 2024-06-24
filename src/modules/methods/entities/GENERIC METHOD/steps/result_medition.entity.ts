import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { GENERIC_METHOD } from "../GENERIC_METHOD.entity";

@Entity('result_medition_GENERIC_METHOD')
export class ResultMeditionGENERIC_METHOD {
  @PrimaryGeneratedColumn()
  id: number
  // Add your columns here
  @ManyToOne(
    () => GENERIC_METHOD,
    (GENERIC_METHOD) => GENERIC_METHOD.result_medition,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
    GENERIC_METHOD: GENERIC_METHOD

    @Column('jsonb', { nullable: true })
    medition: IMedition[]
}

interface IMedition {
  patron1: number
  equiopo1: number  
  patron2: number
  equiopo2: number
  patron3: number
  equiopo3: number
}