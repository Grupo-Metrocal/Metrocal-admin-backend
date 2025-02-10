import { IMethods } from 'src/modules/methods/entities/method.entity'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('patterns')
export class Pattern {
  @PrimaryGeneratedColumn('increment', { type: 'int' })
  id: number

  @Column({ type: 'varchar', nullable: true })
  method: IMethods

  @Column({ type: 'varchar', nullable: false })
  equipment: string

  @Column({ type: 'varchar', nullable: false })
  code: string

  @Column({ type: 'varchar', nullable: false })
  certificate: string

  @Column({ type: 'varchar', nullable: false })
  traceability: string

  @Column({ type: 'varchar', nullable: false })
  pattern_range?: string

  @Column({ type: 'varchar', nullable: false })
  next_calibration: string

  @Column({ type: 'varchar', default: '' })
  brand: string

  @Column({ default: true })
  status: boolean

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date
}
