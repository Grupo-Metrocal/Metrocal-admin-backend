import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { User } from 'src/modules/users/entities/user.entity'

@Entity('notifications')
export class Notifications {
  @PrimaryGeneratedColumn('increment', { type: 'int' })
  id: number

  @Column()
  title: string

  @Column()
  body: string

  @Column()
  read: boolean

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date

  @ManyToOne(() => User, (user) => user.notifications)
  user: User
}
