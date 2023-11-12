import { Column, Entity, PrimaryGeneratedColumn} from 'typeorm'


@Entity('configuration')
export class Configuration {
  @PrimaryGeneratedColumn('increment', { type: 'int' })
  id: number

  @Column({ type: 'varchar', nullable: false })
  type_service: string

  @Column({ type: 'varchar', nullable: false })
  measuring_range: string

}