import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm'

@Entity('NI_MCIT_VE')
export class NI_MCIT_VE {
  @PrimaryGeneratedColumn('increment')
  id: number

  @Column({ nullable: true })
  calibration_location?: string

  @Column({ nullable: true })
  applicant_address?: string

  @Column({ nullable: true })
  applicant_name: string

  @Column({ nullable: true })
  modification_number?: number

  @Column({ nullable: true })
  method_end_date_finished: Date

  @Column({ nullable: true })
  certificate_issue_date: Date

  @Column({ nullable: true, default: false, type: 'boolean' })
  report_status?: boolean

  @Column({ nullable: true, type: 'varchar', array: true, default: [] })
  report_messages?: string[]

  @Column({ nullable: true, default: 'pending' })
  status?: string // pending, done

  @Column({ nullable: true })
  certificate_id?: string

  @Column({ nullable: true })
  certificate_code?: string

  @Column({ nullable: true })
  certificate_url?: string

  @Column({ nullable: true, type: 'boolean', default: false })
  review_state?: boolean

  @Column({ nullable: true })
  review_user_id?: number

  @Column({ default: 0 })
  record_index: number

  @Column({ default: 0 })
  last_record_index: number

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date
}
