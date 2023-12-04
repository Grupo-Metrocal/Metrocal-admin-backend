import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm'
import { Configuration } from './configuration.entity'
@Entity('authorized_services')
export class AuthorizedServices {
  @PrimaryGeneratedColumn('increment', { type: 'int' })
  id: number

  @Column({ type: 'varchar' })
  method: string

  @Column({ type: 'varchar' })
  service: string

  @Column({ type: 'varchar' })
  equipment: string

  @Column({ type: 'varchar', nullable: true })
  description: string

  @Column({ type: 'varchar' })
  measuring_range: string

  @Column({ type: 'varchar' })
  accuracy: string[]

  @Column({ type: 'varchar' })
  document_delivered: string

  @Column({ type: 'float' })
  price: number

  @ManyToOne(
    () => Configuration,
    (configuration) => configuration.authorized_services,
  )
  configuration: Configuration
}
