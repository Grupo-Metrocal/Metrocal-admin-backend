import { Column, Entity, PrimaryGeneratedColumn, ManyToMany } from 'typeorm'
import { User } from 'src/modules/users/entities/user.entity'
@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('increment', { type: 'int' })
  id: number

  @Column({ unique: true, nullable: false })
  name: string

  @Column({ nullable: false })
  description: string

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date

  @ManyToMany(() => User, (user) => user.roles)
  users: User[]

  @Column({ nullable: true })
  label: string

  @Column({ nullable: true })
  priority: number
}
