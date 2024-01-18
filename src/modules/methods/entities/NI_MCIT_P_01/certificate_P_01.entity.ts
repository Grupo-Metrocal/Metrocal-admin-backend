import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm'
import { NI_MCIT_P_01 } from './NI_MCIT_P_01.entity'

@Entity('certificate_P_01')
export class certificate_P_01 {
  @PrimaryGeneratedColumn('increment')
  id: number

  @OneToMany(() => NI_MCIT_P_01, (NI_MCIT_P_01) => NI_MCIT_P_01.certificate, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  method: NI_MCIT_P_01[]

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date
}
