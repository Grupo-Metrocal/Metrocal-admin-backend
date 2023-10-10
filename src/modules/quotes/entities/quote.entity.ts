import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm'
import { QuoteRequest } from './quote-request.entity'
import { User } from 'src/modules/users/entities/user.entity'

@Entity('quotes')
export class Quote {
  @PrimaryGeneratedColumn('increment', { type: 'int' })
  id: number

  @OneToOne(() => QuoteRequest, (quoteRequest) => quoteRequest.quote)
  quote_request: QuoteRequest

  @ManyToMany(() => User, (user) => user.quotes)
  @JoinTable()
  workers?: User[]

  @Column({ type: 'varchar', default: 'active' })
  status: string // 'active' | 'inactive'

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date

  @Column({ type: 'timestamp', nullable: true })
  updated_at: Date
}
