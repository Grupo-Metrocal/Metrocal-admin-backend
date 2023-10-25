import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm'
import { QuoteRequest } from 'src/modules/quotes/entities/quote-request.entity'

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn('increment', { type: 'int' })
  id: number

  @OneToMany(() => QuoteRequest, (quote_request) => quote_request.client, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  quote_requests: QuoteRequest[]

  @Column({ type: 'varchar', nullable: false })
  company_name: string

  @Column({ type: 'varchar', nullable: false })
  phone: string

  @Column({ type: 'varchar', nullable: false })
  address: string

  @Column({ type: 'varchar', nullable: true })
  no_ruc?: string

  @Column({ type: 'varchar', nullable: false })
  email: string

  @Column({ type: 'varchar', nullable: false })
  requested_by: string

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date
}
