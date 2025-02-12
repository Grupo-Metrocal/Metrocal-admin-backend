import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('engine')
export class Engine {
  @PrimaryGeneratedColumn('increment', { type: 'int' })
  id: number

  @Column()
  calibration_method: string

  @Column({ nullable: true })
  alternative_path: string

  @Column()
  default_path: string

  @Column({ nullable: true })
  pattern: string

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date
}
