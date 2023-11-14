import { Column, Entity, PrimaryGeneratedColumn} from 'typeorm'



@Entity('equipmentregister')
export class EquipmentRegister {
  @PrimaryGeneratedColumn('increment', { type: 'int' })
  id: number

  @Column({ type: 'varchar', nullable: false })
  type_service: string

  @Column({ type: 'varchar', nullable: false })
  equipment: string[]

  @Column({ type: 'varchar', nullable: false })
  measuring_range: string[]

  /*@Column({type: 'decimal', nullable: false })
  IVA:number*/
}

@Entity('ivaregister')
export class IvaRegister{

  @PrimaryGeneratedColumn('increment', { type: 'int' })
  id: number
  
  @Column({ type: 'decimal', nullable: false })
  IVA: number


}


