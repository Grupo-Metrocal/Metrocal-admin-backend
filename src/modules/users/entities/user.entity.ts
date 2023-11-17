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
import { Activity } from 'src/modules/activities/entities/activities.entity'
import { Notifications } from 'src/modules/notifications/entities/notification.entity'

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

  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable()
  roles: Role[]

  @OneToMany(() => QuoteRequest, (quoteRequest) => quoteRequest.approved_by)
  quote_requests: QuoteRequest[]

  @ManyToMany(() => Activity, (activity) => activity.team_members)
  activities: Activity[]

  @OneToMany(() => Notifications, (notifications) => notifications.user)
  notifications: Notifications[]

  @Column({ type: 'varchar', nullable: true })
  notification_token: string
}
