import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm'
import { NI_MCIT_D_01 } from '../NI_MCIT_D_01.entity'
import { StringDecoder } from 'string_decoder'

@Entity('equipment_information_NI_MCIT_D_01')
export class EquipmentInformationNI_MCIT_D_01 {
  @PrimaryGeneratedColumn()
  id: number

  @OneToMany(
    () => NI_MCIT_D_01,
    (NI_MCIT_D_01) => NI_MCIT_D_01.equipment_information,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  NI_MCIT_D_01: NI_MCIT_D_01[]

  @Column({ type: 'varchar', nullable: true })
  device?: string

  @Column({ type: 'varchar', nullable: true })
  maker?: string

  @Column({ type: 'varchar', nullable: true })
  serial_number?: string

  @Column({ type: 'varchar', nullable: true })
  unit: string

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
