import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm'
import { QuoteRequest } from './quote-request.entity'

@Entity('equipment_quote_requests')
export class EquipmentQuoteRequest {
  @PrimaryGeneratedColumn('increment', { type: 'int' })
  id: number

  @ManyToOne(
    () => QuoteRequest,
    (quote_request) => quote_request.equipment_quote_request,
  )
  quote_request: QuoteRequest

  @Column({ type: 'varchar', nullable: false })
  name: string

  @Column({ type: 'varchar', nullable: false })
  type_service: string

  @Column({ type: 'int', nullable: false })
  count: number

  @Column({ type: 'varchar', nullable: false })
  model: string

  @Column()
  measuring_range: boolean

  @Column({ type: 'varchar', nullable: false })
  calibration_method: string

  @Column({ type: 'varchar', nullable: false })
  additional_remarks: string

  @Column({ type: 'int', nullable: false })
  discount: number
}
