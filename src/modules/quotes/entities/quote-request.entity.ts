import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToOne,
} from 'typeorm'
import { User } from 'src/modules/users/entities/user.entity'
import { EquipmentQuoteRequest } from './equipment-quote-request.entity'
import { Quote } from './quote.entity'

@Entity('quote_requests')
export class QuoteRequest {
  @PrimaryGeneratedColumn('increment', { type: 'int' })
  id: number

  // falta el campo del cliente

  @Column({ type: 'varchar', nullable: false, default: 'pending' })
  status: string // 'pending' | 'waiting' | 'done'

  @OneToOne(
    () => EquipmentQuoteRequest,
    (equipment_quote_request) => equipment_quote_request.quote_request,
  )
  equipment_quote_request: EquipmentQuoteRequest

  @Column({ type: 'int', nullable: false })
  general_discount: number

  @Column({ type: 'int', nullable: false })
  tax: number

  @Column({ type: 'int', nullable: false })
  price: number

  @ManyToOne(() => User, (user) => user.quote_requests)
  approved_by: User

  @OneToOne(() => Quote, (quote) => quote.quote_request)
  quote: Quote

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date

  @Column({ type: 'timestamp', nullable: true })
  updated_at: Date
}
