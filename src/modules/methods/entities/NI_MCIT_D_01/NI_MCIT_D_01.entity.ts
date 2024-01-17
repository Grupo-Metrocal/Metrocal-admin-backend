import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { EquipmentInformationNI_MCIT_D_01 } from "./steps/equipment_information.entity"
import { InstrumentZeroCheckNI_MCIT_D_01 } from "./steps/Instrument_zero_check.entity"
import { DescriptionPatternNI_MCIT_D_01 } from "./steps/description_pattern.entity"
import { EnvironmentalConditionsNI_MCIT_D_01 } from "./steps/enviromental_conditions.entity"
import { ExternalParallelismMeasurementNI_MCIT_D_01 } from "./steps/external_parallelism_measurement.entity"
import { ObservationPriorCalibrationNI_MCIT_D_01 } from "./steps/observation_prior_calibration.entity"

@Entity('NI_MCIT_D_01')
export class NI_MCIT_D_01 {
  @PrimaryGeneratedColumn('increment')
  id: number

  @Column({ nullable: true })
  calibration_location?: string
//step2
  @ManyToOne(
    () => EquipmentInformationNI_MCIT_D_01,
    (EquipmentInformationNI_MCIT_D_01) =>
      EquipmentInformationNI_MCIT_D_01.NI_MCIT_D_01,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  equipment_information: EquipmentInformationNI_MCIT_D_01

//step3
    @ManyToOne(
        () => EnvironmentalConditionsNI_MCIT_D_01,
        (EnvironmentalConditionsNI_MCIT_D_01) =>
        EnvironmentalConditionsNI_MCIT_D_01.NI_MCIT_D_01,
        {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        },
    )
  environmental_conditions: EnvironmentalConditionsNI_MCIT_D_01

//step4
    @ManyToOne(
        () => ObservationPriorCalibrationNI_MCIT_D_01,
        (ObservationPriorCalibrationNI_MCIT_D_01) =>
        ObservationPriorCalibrationNI_MCIT_D_01.NI_MCIT_D_01,
        {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        },
    )   
    observation_prior_calibration:ObservationPriorCalibrationNI_MCIT_D_01
//step5
    @ManyToOne(
        () => DescriptionPatternNI_MCIT_D_01,
        (DescriptionPatternNI_MCIT_D_01) =>
        DescriptionPatternNI_MCIT_D_01.NI_MCIT_D_01,
        {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        },
    )   
    description_pattern:DescriptionPatternNI_MCIT_D_01
//step6
    @ManyToOne(
        () => InstrumentZeroCheckNI_MCIT_D_01,
        (InstrumentZeroCheckNI_MCIT_D_01) =>
        InstrumentZeroCheckNI_MCIT_D_01.NI_MCIT_D_01,
        {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        },
    )   
    instrument_zero_check:InstrumentZeroCheckNI_MCIT_D_01
//step7
    @ManyToOne(
        () => ExternalParallelismMeasurementNI_MCIT_D_01,
        (ExternalParallelismMeasurementNI_MCIT_D_01) =>
        ExternalParallelismMeasurementNI_MCIT_D_01.NI_MCIT_D_01,
        {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        },
    )   
    external_parallelism_measurement:ExternalParallelismMeasurementNI_MCIT_D_01

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date
}
