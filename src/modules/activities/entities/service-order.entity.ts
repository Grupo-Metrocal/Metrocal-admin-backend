import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm'
import { Activity } from './activities.entity'

@Entity('service-order')
export class ServiceOrder {
  @PrimaryGeneratedColumn('increment', { type: 'int' })
  id: number

  @ManyToOne(() => Activity, (activity) => activity.service_order, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  activity: Activity

  @Column({ type: 'jsonb' })
  equipments_ids: number[]

  @Column({ type: 'varchar' })
  start_time: string

  @Column({ type: 'varchar' })
  end_time: string

  @Column()
  finish_date: Date

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date

  @Column({ type: 'timestamp', nullable: true })
  updated_at: Date
}
