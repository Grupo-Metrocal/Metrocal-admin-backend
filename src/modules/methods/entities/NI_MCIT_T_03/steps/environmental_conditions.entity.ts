import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm'
import { NI_MCIT_T_03 } from '../NI_MCIT_T_03.entity'

@Entity('environmental_conditions_NI_MCIT_T_03')
export class EnvironmentalConditionsNI_MCIT_T_03 {
  @PrimaryGeneratedColumn('increment')
  id: number

  @OneToMany(
    () => NI_MCIT_T_03,
    (NI_MCIT_P_03) => NI_MCIT_P_03.environmental_conditions,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  NI_MCIT_T_03: NI_MCIT_T_03[]

  @Column({ nullable: true, type: 'float' })
  temperature: number

  @Column({ nullable: true, type: 'float' })
  humidity: number
}
