import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm'
import { User } from 'src/modules/users/entities/user.entity'
import { EquipmentQuoteRequest } from './equipment-quote-request.entity'
import { Activity } from 'src/modules/activities/entities/activities.entity'
import { Client } from 'src/modules/clients/entities/client.entity'

@Entity('quote_requests')
export class QuoteRequest {
  @PrimaryGeneratedColumn('increment', { type: 'int' })
  id: number

  @ManyToOne(() => Client, (client) => client.quote_requests)
  client: Client

  @Column({ type: 'varchar', nullable: false, default: 'pending' })
  status: 'pending' | 'waiting' | 'done' | 'rejected' | 'canceled'

  @OneToMany(
    () => EquipmentQuoteRequest,
    (EquipmentQuoteRequest) => EquipmentQuoteRequest.quote_request,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  equipment_quote_request: EquipmentQuoteRequest[]

  @Column({ nullable: true, type: 'float' })
  general_discount: number

  @Column({ type: 'float', nullable: false, default: 15 })
  tax: number

  @Column({ type: 'float', nullable: true })
  price: number

  @ManyToOne(() => User, (user) => user.quote_requests)
  approved_by: User

  @Column({ type: 'varchar', nullable: true })
  no?: string

  @Column({ default: null })
  service_request_code: string

  @OneToOne(() => Activity, (activity) => activity.quote_request, {
    cascade: true,
  })
  @JoinColumn()
  activity: Activity

  @Column({ type: 'varchar', nullable: true })
  rejected_comment?: string

  @Column({ type: 'varchar', nullable: true })
  rejected_options?: string[]

  @Column({ default: null })
  rejected_by: 'client' | 'staff'

  @Column({ type: 'float', nullable: true, default: 0 })
  extras?: number

  @Column({ type: 'varchar', nullable: true })
  quote_modification_message: string

  @Column({ type: 'varchar', nullable: true, default: 'none' })
  quote_modification_status: 'none' | 'pending' | 'done'

  @Column({ nullable: true })
  modification_number?: number

  @Column({ default: 0 })
  record_index: number

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date

  @Column({ type: 'timestamp', nullable: true })
  updated_at: Date
}
