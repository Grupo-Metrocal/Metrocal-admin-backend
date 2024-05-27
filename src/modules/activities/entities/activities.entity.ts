import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm'
import { User } from 'src/modules/users/entities/user.entity'
import { QuoteRequest } from 'src/modules/quotes/entities/quote-request.entity'

@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn('increment', { type: 'int' })
  id: number

  @OneToOne(() => QuoteRequest, (quoteRequest) => quoteRequest.activity)
  quote_request: QuoteRequest

  @ManyToMany(() => User, (user) => user.activities)
  @JoinTable()
  team_members?: User[]

  @Column({ type: 'varchar', default: 'pending' })
  status: string // pending, done, canceled

  @Column({ type: 'float', nullable: true, default: 0 })
  progress: number

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date

  @Column({ type: 'timestamp', nullable: true })
  updated_at: Date

  @Column({ nullable: true })
  responsable: number

  @Column({ type: 'varchar', nullable: true })
  client_signature: string

  @Column('jsonb', { nullable: true })
  work_areas?: string[]

  @Column('jsonb', { nullable: true })
  comments_insitu?: string[]

  @Column({ nullable: true, default: false })
  reviewed: boolean

  @Column({ type: 'varchar', nullable: true })
  reviewed_user_id: number
}
