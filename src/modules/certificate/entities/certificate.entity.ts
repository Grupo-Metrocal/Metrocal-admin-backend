import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('certificate')
export class Certificate {
  @PrimaryGeneratedColumn('increment')
  id: number

  @Column({ nullable: true })
  name: string

  @Column({ nullable: true })
  code: string

  @Column({ nullable: true, type: 'int', default: 0 })
  modifications: number

  @Column('timestamp', { nullable: true, default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date

  @Column('timestamp', { nullable: true })
  updated_at: Date
}
