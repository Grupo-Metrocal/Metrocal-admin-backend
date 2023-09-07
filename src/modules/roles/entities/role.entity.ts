import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

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
}
