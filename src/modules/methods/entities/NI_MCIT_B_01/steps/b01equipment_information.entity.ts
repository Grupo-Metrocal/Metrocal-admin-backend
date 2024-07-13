import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { NI_MCIT_B_01 } from '../NI_MCIT_B_01.entity'

@Entity('EquipmentInformationNI_MCIT_B_01')
export class EquipmentInformationNI_MCIT_B_01 {
  @PrimaryGeneratedColumn()
  id: number

  @OneToMany(
    () => NI_MCIT_B_01,
    (NI_MCIT_B_01) => NI_MCIT_B_01.equipment_information,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  NI_MCIT_B_01: NI_MCIT_B_01[]

  @Column({ type: 'varchar', nullable: true })
  device?: string

  @Column({ type: 'varchar', nullable: true })
  maker?: string

  @Column({ type: 'varchar', nullable: true })
  serial_number?: string

  @Column({ type: 'varchar', nullable: true })
  measurement_range?: string

  @Column({ type: 'varchar', nullable: true })
  resolution?: string

  @Column({ type: 'varchar', nullable: true })
  model?: string

  @Column({ type: 'varchar', nullable: true })
  code?: string

  //fecha
  @Column({ type: 'varchar', nullable: true })
  date?: string

  //acredited boolean
  @Column({ type: 'boolean', nullable: true })
  acredited?: boolean

  @Column({ nullable: true })
  unit?: string
}
