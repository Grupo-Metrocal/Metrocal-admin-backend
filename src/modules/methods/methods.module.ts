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

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NI_MCIT_P_01,
      EquipmentInformationNI_MCIT_P_01,
      EnvironmentalConditionsNI_MCIT_P_01,
      CalibrationResultsNI_MCIT_P_01,
      DescriptionPatternNI_MCIT_P_01,
    ]),
    forwardRef(() => ActivitiesModule),
    forwardRef(() => QuotesModule),
  ],
  controllers: [MethodsController],
  providers: [MethodsService, NI_MCIT_P_01Service],
  exports: [MethodsService],
})
export class MethodsModule {}
