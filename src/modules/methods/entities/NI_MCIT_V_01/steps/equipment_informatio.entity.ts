import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm'
import { NI_MCIT_V_01 } from '../NI_MCIT_V_01.entity'

@Entity('equipment_information_NI_MCIT_V_01')
export class EquipmentInformationNI_MCIT_V_01 {
  @PrimaryGeneratedColumn()
  id: number

  @OneToMany(
    () => NI_MCIT_V_01,
    (NI_MCIT_V_01) => NI_MCIT_V_01.equipment_information,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  NI_MCIT_V_01: NI_MCIT_V_01[]

  @Column({ type: 'varchar', nullable: true })
  device?: string

  @Column({ type: 'varchar', nullable: true })
  maker?: string

  @Column({ type: 'varchar', nullable: true })
  serial_number?: string

  @Column({ type: 'varchar', nullable: true })
  measurement_range?: string

  @Column({ type: 'float', nullable: true })
  nominal_range?: number

  @Column({ type: 'float', nullable: true })
  scale_division?: number

  @Column({ type: 'varchar', nullable: true })
  unit?: string

  @Column({ type: 'varchar', nullable: true })
  model?: string

  @Column({ type: 'varchar', nullable: true })
  code?: string

  @Column({ type: 'float', nullable: true })
  resolution?: number

  @Column({ type: 'varchar', nullable: true })
  balance?: string

  @Column({ type: 'varchar', nullable: true })
  thermometer?: string

  @Column({ type: 'varchar', nullable: true })
  volumetric_container?: string

  @Column({ type: 'varchar', nullable: true })
  neck_diameter?: string

  @Column({ type: 'varchar', nullable: true })
  material?: string
}
