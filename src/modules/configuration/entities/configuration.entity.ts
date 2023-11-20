import { Column, Entity, PrimaryGeneratedColumn} from 'typeorm'
@Entity('configurations')
export class Configuration {
  @PrimaryGeneratedColumn('increment', { type: 'int' })
  id: number
  @Column({ type: 'float', nullable: false, default: 15 })
  IVA:number
}

@Entity('equipment_register')
export class EquipmentRegister {
  @PrimaryGeneratedColumn('increment', { type: 'int' })
  id: number

  @Column({ type: 'varchar', nullable: false })
  method: string 

  @Column({ type: 'varchar', nullable: false })
  service: string
// es un arreglo de string para los que tienen descripcion o no simplemente agregarlo cuando sea necesario
  @Column({ type: 'varchar', nullable: false })
  description: string[]

  @Column({ type: 'varchar', nullable: false })
  measuring_range: string

  @Column({ type: 'varchar', nullable: false })
  accuracy: string[]

  @Column({ type: 'varchar', nullable: false })
  document_delivered: string 

  @Column({ type: 'float', nullable: false })
  price: number

}