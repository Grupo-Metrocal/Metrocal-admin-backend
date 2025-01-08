import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm'
import { QuoteRequest } from './quote-request.entity'

@Entity('equipment_quote_requests')
export class EquipmentQuoteRequest {
  @PrimaryGeneratedColumn('increment', { type: 'int' })
  id: number

  @ManyToOne(
    () => QuoteRequest,
    (quote_request) => quote_request.equipment_quote_request,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  quote_request: QuoteRequest

  @Column({ type: 'varchar' })
  name: string

  @Column({ type: 'varchar' })
  type_service: string

  @Column({ type: 'int' })
  count: number

  @Column({ type: 'varchar' })
  model: string

  @Column({ type: 'varchar', nullable: true })
  measuring_range?: string

  @Column({ type: 'varchar', default: '' })
  calibration_method?: string

  @Column({ type: 'varchar', default: '' })
  additional_remarks?: string

  @Column({ type: 'float', nullable: true })
  discount?: number

  @Column({ default: 'pending' })
  status?: string // done, rejected, pending

  @Column({ type: 'varchar', nullable: true })
  comment?: string

  @Column({ type: 'float', default: 0 })
  price?: number

  @Column({ type: 'float', default: 0 })
  total?: number

  @Column({ nullable: true })
  method_id?: number

  @Column({ nullable: true, default: 'pending' })
  review_status?: string // reviewed, pending

  @Column({ type: 'boolean', nullable: false, default: false })
  isResolved: boolean

  @Column({ nullable: true, default: '' })
  review_comment?: string

  @Column({ nullable: true, default: true })
  is_creditable?: boolean

  @Column({ nullable: true, default: '' })
  use_alternative_certificate_method?: string

  @Column({ nullable: true, default: false })
  isConfirmReviewActivity?: boolean

  @Column({ nullable: true, default: false })
  isEmitedServicesOrder: boolean
}
