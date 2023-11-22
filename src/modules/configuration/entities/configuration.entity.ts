import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm'
import { AuthorizedServices } from './authorized_services.entity'
@Entity('configurations')
export class Configuration {
  @PrimaryGeneratedColumn('increment', { type: 'int' })
  id: number
  @Column({ type: 'float', nullable: false, default: 15 })
  IVA: number

  @OneToMany(
    () => AuthorizedServices,
    (authorized_services) => authorized_services.configuration,
  )
  authorized_services: AuthorizedServices[]
}
