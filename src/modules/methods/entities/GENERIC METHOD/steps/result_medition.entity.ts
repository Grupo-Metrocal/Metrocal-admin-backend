import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { GENERIC_METHOD } from '../GENERIC_METHOD.entity'

@Entity('result_medition_GENERIC_METHOD')
export class ResultMeditionGENERIC_METHOD {
  @PrimaryGeneratedColumn()
  id: number

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
  meditions: IMedition[]
}

export interface IMedition {
  medition: {
    patron: number
    equipment: number
  }[]
}
