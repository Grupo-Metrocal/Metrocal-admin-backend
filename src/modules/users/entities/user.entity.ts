import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm'
import { Role } from 'src/modules/roles/entities/role.entity'
import { QuoteRequest } from 'src/modules/quotes/entities/quote-request.entity'
import { Quote } from 'src/modules/quotes/entities/quote.entity'

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('increment', { type: 'int' })
  id: number

  @Column({ type: 'varchar', nullable: false })
  username: string

  @Column({ type: 'varchar', nullable: false })
  password: string

  @Column({ type: 'varchar', nullable: false })
  email: string

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date

  @ManyToOne(() => Role, (role) => role.users)
  roles: Role[]

  @OneToMany(() => QuoteRequest, (quoteRequest) => quoteRequest.approved_by)
  quote_requests: QuoteRequest[]

  @ManyToMany(() => Quote, (quote) => quote.workers)
  @JoinTable()
  quotes: Quote[]
}
