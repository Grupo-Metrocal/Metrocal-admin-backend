import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm'
import { NI_MCIT_D_02 } from '../NI_MCIT_D_02.entity'

@Entity('equipment_information_NI_MCIT_D_02')
export class EquipmentInformationNI_MCIT_D_02 {
  @PrimaryGeneratedColumn('increment')
  id: number

  @OneToMany(
    () => NI_MCIT_D_02,
    (NI_MCIT_D_02) => NI_MCIT_D_02.equipment_information,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  NI_MCIT_D_02: NI_MCIT_D_02[]

  @Column({ type: 'varchar', nullable: true })
  device?: string

  @Column({ type: 'varchar', nullable: true })
  maker?: string

  @Column({ type: 'varchar', nullable: true })
  serial_number?: string

  @Column({ type: 'varchar', nullable: true })
  unit?: string

  @Column({ type: 'float', nullable: true })
  range_min: number

  @Column({ type: 'float', nullable: true })
  range_max: number

  @Column({ type: 'varchar', nullable: true })
  resolution?: number

  @Column({ type: 'varchar', nullable: true })
  model?: string

  @Column({ type: 'varchar', nullable: true })
  code?: string

  @Column({ type: 'varchar', nullable: true })
  length?: string

  //fecha
  @Column({ type: 'varchar', nullable: true })
  date?: string
}
