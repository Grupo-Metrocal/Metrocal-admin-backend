import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm'
import { Role } from 'src/modules/roles/entities/role.entity'
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
}
