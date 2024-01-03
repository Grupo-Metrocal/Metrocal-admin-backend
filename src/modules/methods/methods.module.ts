import { Module, forwardRef } from '@nestjs/common'
import { MethodsService } from './methods.service'

import { MethodsController } from './methods.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ActivitiesModule } from '../activities/activities.module'
import { QuotesModule } from '../quotes/quotes.module'

import { NI_MCIT_P_01Service } from './ni-mcit-p-01.service'
import { NI_MCIT_P_01 } from './entities/NI_MCIT_P_01/NI_MCIT_P_01.entity'
import { EquipmentInformationNI_MCIT_P_01 } from './entities/NI_MCIT_P_01/steps/equipment_informatio.entity'
import { EnvironmentalConditionsNI_MCIT_P_01 } from './entities/NI_MCIT_P_01/steps/environmental_conditions.entity'
import { CalibrationResultsNI_MCIT_P_01 } from './entities/NI_MCIT_P_01/steps/calibration_results.entity'
import { DescriptionPatternNI_MCIT_P_01 } from './entities/NI_MCIT_P_01/steps/description_pattern.entity'

import { NI_MCIT_D_02Service } from './ni-mcit-d-02.service'
import { NI_MCIT_D_02 } from './entities/NI_MCIT_D_02/NI_MCIT_D_02.entity'
import { AccuracyTestNI_MCIT_D_02 } from './entities/NI_MCIT_D_02/steps/accuracy_test.entity'
import { DescriptionPatternNI_MCIT_D_02 } from './entities/NI_MCIT_D_02/steps/description_pattern.entity'
import { EnvironmentalConditionsNI_MCIT_D_02 } from './entities/NI_MCIT_D_02/steps/environmental_conditions.entity'
import { EquipmentInformationNI_MCIT_D_02 } from './entities/NI_MCIT_D_02/steps/equipment_informatio.entity'
import { InstrumentZeroCheckNI_MCIT_D_02 } from './entities/NI_MCIT_D_02/steps/instrument_zero_check.entity'
import { PreInstallationCommentNI_MCIT_D_02 } from './entities/NI_MCIT_D_02/steps/pre_installation_comment.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NI_MCIT_P_01,
      EquipmentInformationNI_MCIT_P_01,
      EnvironmentalConditionsNI_MCIT_P_01,
      CalibrationResultsNI_MCIT_P_01,
      DescriptionPatternNI_MCIT_P_01,

      NI_MCIT_D_02,
      AccuracyTestNI_MCIT_D_02,
      DescriptionPatternNI_MCIT_D_02,
      EnvironmentalConditionsNI_MCIT_D_02,
      EquipmentInformationNI_MCIT_D_02,
      InstrumentZeroCheckNI_MCIT_D_02,
      PreInstallationCommentNI_MCIT_D_02
    ]),
    forwardRef(() => ActivitiesModule),
    forwardRef(() => QuotesModule),
  ],
  controllers: [MethodsController],
  providers: [MethodsService, NI_MCIT_P_01Service, NI_MCIT_D_02Service],
  exports: [MethodsService],
})
export class MethodsModule {}
