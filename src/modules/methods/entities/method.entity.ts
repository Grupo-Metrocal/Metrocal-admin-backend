import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('methods')
export class Methods {
  @PrimaryGeneratedColumn('increment')
  id: number

  @Column({ type: 'jsonb' })
  methodsID: number[]

  @Column()
  method_name: string
}
