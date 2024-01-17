import { Module, forwardRef } from '@nestjs/common'
import { MethodsService } from './methods.service'
import { NI_MCIT_P_01Service } from './ni-mcit-p-01.service'
import { MethodsController } from './methods.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { NI_MCIT_P_01 } from './entities/NI_MCIT_P_01/NI_MCIT_P_01.entity'

import { EquipmentInformationNI_MCIT_P_01 } from './entities/NI_MCIT_P_01/steps/equipment_informatio.entity'
import { EnvironmentalConditionsNI_MCIT_P_01 } from './entities/NI_MCIT_P_01/steps/environmental_conditions.entity'
import { CalibrationResultsNI_MCIT_P_01 } from './entities/NI_MCIT_P_01/steps/calibration_results.entity'
import { DescriptionPatternNI_MCIT_P_01 } from './entities/NI_MCIT_P_01/steps/description_pattern.entity'
import { ActivitiesModule } from '../activities/activities.module'
import { QuotesModule } from '../quotes/quotes.module'

import { NI_MCIT_D_01Service } from './ni_mcit_d_01.service'
import { EquipmentInformationNI_MCIT_D_01 } from './entities/NI_MCIT_D_01/steps/equipment_information.entity'
import { EnvironmentalConditionsNI_MCIT_D_01 } from './entities/NI_MCIT_D_01/steps/enviromental_conditions.entity'
import { DescriptionPatternNI_MCIT_D_01 } from './entities/NI_MCIT_D_01/steps/description_pattern.entity'
import { ObservationPriorCalibrationNI_MCIT_D_01 } from './entities/NI_MCIT_D_01/steps/observation_prior_calibration.entity'
import { InstrumentZeroCheckNI_MCIT_D_01 } from './entities/NI_MCIT_D_01/steps/Instrument_zero_check.entity'
import { ExternalParallelismMeasurementNI_MCIT_D_01 } from './entities/NI_MCIT_D_01/steps/external_parallelism_measurement.entity'
import { NI_MCIT_D_01 } from './entities/NI_MCIT_D_01/NI_MCIT_D_01.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NI_MCIT_P_01,
      EquipmentInformationNI_MCIT_P_01,
      EnvironmentalConditionsNI_MCIT_P_01,
      CalibrationResultsNI_MCIT_P_01,
      DescriptionPatternNI_MCIT_P_01,
      NI_MCIT_D_01,
      EquipmentInformationNI_MCIT_D_01,
      EnvironmentalConditionsNI_MCIT_D_01,
      DescriptionPatternNI_MCIT_D_01,
      ObservationPriorCalibrationNI_MCIT_D_01,
      InstrumentZeroCheckNI_MCIT_D_01,
      ExternalParallelismMeasurementNI_MCIT_D_01,

    ]),
    forwardRef(() => ActivitiesModule),
    forwardRef(() => QuotesModule),
  ],
  controllers: [MethodsController],
  providers: [MethodsService, NI_MCIT_P_01Service,NI_MCIT_D_01Service],
  exports: [MethodsService],
})
export class MethodsModule {}
