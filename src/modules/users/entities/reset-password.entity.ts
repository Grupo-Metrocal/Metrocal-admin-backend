import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm'

@Entity('reset-password')
export class ResetPassword {
  @PrimaryGeneratedColumn('increment', { type: 'int' })
  id: number

  @Column({ type: 'varchar', nullable: false })
  email: string

  // unique code
  @Column({ type: 'varchar', nullable: false })
  code: string

  @Column({ type: 'timestamp', nullable: true })
  experiedAt: Date
}
