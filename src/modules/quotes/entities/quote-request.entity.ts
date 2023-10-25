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
import { Quote } from './quote.entity'
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

  @Column({ type: 'int', nullable: false })
  general_discount: number

  @Column({ type: 'int', nullable: false, default: 15 })
  tax: number

  @Column({ type: 'float', nullable: true })
  price: number

  @ManyToOne(() => User, (user) => user.quote_requests)
  approved_by: User

  @Column({ type: 'varchar', nullable: true })
  no?: string

  @OneToOne(() => Quote, (quote) => quote.quote_request, {
    cascade: true,
  })
  @JoinColumn()
  quote: Quote

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date

  @Column({ type: 'timestamp', nullable: true })
  updated_at: Date
}
