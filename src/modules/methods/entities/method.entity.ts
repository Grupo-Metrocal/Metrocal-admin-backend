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

export interface IMethods {
  methd:
    | 'NI-MCIT-B-01'
    | 'NI-MCIT-D-01'
    | 'NI-MCIT-D-01'
    | 'NI-MCIT-M-01'
    | 'NI-MCIT-P-01'
    | 'NI-MCIT-T-01'
    | 'NI-MCIT-T-03'
    | 'NI-MCIT-T-05'
    | 'NI-MCIT-V-01'
}
