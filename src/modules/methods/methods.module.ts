import { Module, forwardRef } from '@nestjs/common'
import { MethodsService } from './methods.service'

import { MethodsController } from './methods.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ActivitiesModule } from '../activities/activities.module'
import { QuotesModule } from '../quotes/quotes.module'
import { Methods } from './entities/method.entity'
import { CertificateModule } from '../certificate/certificate.module'
import { PatternsModule } from '../patterns/patterns.module'

import { NI_MCIT_P_01Service } from './ni-mcit-p-01.service'
import { NI_MCIT_P_01 } from './entities/NI_MCIT_P_01/NI_MCIT_P_01.entity'
import { EquipmentInformationNI_MCIT_P_01 } from './entities/NI_MCIT_P_01/steps/equipment_informatio.entity'
import { EnvironmentalConditionsNI_MCIT_P_01 } from './entities/NI_MCIT_P_01/steps/environmental_conditions.entity'
import { CalibrationResultsNI_MCIT_P_01 } from './entities/NI_MCIT_P_01/steps/calibration_results.entity'
import { DescriptionPatternNI_MCIT_P_01 } from './entities/NI_MCIT_P_01/steps/description_pattern.entity'

import { NI_MCIT_D_02Service } from './ni-mcit-d-02.service'
import { NI_MCIT_D_02 } from './entities/NI_MCIT_D_02/NI_MCIT_D_02.entity'
import { AccuracyTestNI_MCIT_D_02 } from './entities/NI_MCIT_D_02/steps/d02accuracy_test.entity'
import { DescriptionPatternNI_MCIT_D_02 } from './entities/NI_MCIT_D_02/steps/d02description_pattern.entity'
import { EnvironmentalConditionsNI_MCIT_D_02 } from './entities/NI_MCIT_D_02/steps/d02environmental_conditions.entity'
import { EquipmentInformationNI_MCIT_D_02 } from './entities/NI_MCIT_D_02/steps/d02equipment_informatio.entity'
import { InstrumentZeroCheckNI_MCIT_D_02 } from './entities/NI_MCIT_D_02/steps/d02instrument_zero_check.entity'
import { PreInstallationCommentNI_MCIT_D_02 } from './entities/NI_MCIT_D_02/steps/d02pre_installation_comment.entity'

import { NI_MCIT_D_01 } from './entities/NI_MCIT_D_01/NI_MCIT_D_01.entity'
import { EquipmentInformationNI_MCIT_D_01 } from './entities/NI_MCIT_D_01/steps/equipment_informatio.entity'
import { EnvironmentalConditionsNI_MCIT_D_01 } from './entities/NI_MCIT_D_01/steps/environmental_conditions.entity'
import { DescriptionPatternNI_MCIT_D_01 } from './entities/NI_MCIT_D_01/steps/description_pattern.entity'
import { PreInstallationCommentNI_MCIT_D_01 } from './entities/NI_MCIT_D_01/steps/pre_installation_comment.entity'
import { InstrumentZeroCheckNI_MCIT_D_01 } from './entities/NI_MCIT_D_01/steps/instrument_zero_check.entity'
import { ExteriorParallelismMeasurementNI_MCIT_D_01 } from './entities/NI_MCIT_D_01/steps/exterior_parallelism_measurement.entity'
import { InteriorParallelismMeasurementNI_MCIT_D_01 } from './entities/NI_MCIT_D_01/steps/interior_parallelism_measurement.entity'
import { ExteriorMeasurementAccuracyNI_MCIT_D_01 } from './entities/NI_MCIT_D_01/steps/exterior_measurement_accuracy.entity'
import { NI_MCIT_D_01Service } from './ni-mcit-d-01.service'
import { PdfService } from '../mail/pdf.service'
import { MailService } from '../mail/mail.service'

import { NI_MCIT_T_01Service } from './ni-mcit-t-01.service'
import { NI_MCIT_T_01 } from './entities/NI_MCIT_T_01/NI_MCIT_T_01.entity'
import { EquipmentInformationNI_MCIT_T_01 } from './entities/NI_MCIT_T_01/steps/equipment_informatio.entity'
import { EnvironmentalConditionsNI_MCIT_T_01 } from './entities/NI_MCIT_T_01/steps/environmental_conditions.entity'
import { DescriptionPatternNI_MCIT_T_01 } from './entities/NI_MCIT_T_01/steps/description_pattern.entity'
import { CalibrationResultsNI_MCIT_T_01 } from './entities/NI_MCIT_T_01/steps/calibration_results.entity'

import { NI_MCIT_M_01Service } from './ni-mcit-m-01.service'
import { NI_MCIT_M_01 } from './entities/NI_MCIT_M_01/NI_MCIT_M_01.entity'
import { EquipmentInformationNI_MCIT_M_01 } from './entities/NI_MCIT_M_01/steps/equipment_information.entity'
import { DataNI_MCIT_M_01 } from './entities/NI_MCIT_M_01/steps/data.entity'
import { TokenService } from '../auth/jwt/jwt.service'
import { NI_MCIT_B_01 } from './entities/NI_MCIT_B_01/NI_MCIT_B_01.entity'
import { NI_MCIT_B_01Service } from './ni-mcit-b-01.service'
import { EnvironmentalConditionsNI_MCIT_B_01 } from './entities/NI_MCIT_B_01/steps/b01enviromental_condition.entity'
import { EquipmentInformationNI_MCIT_B_01 } from './entities/NI_MCIT_B_01/steps/b01equipment_information.entity'
import { EccentricityTestNI_MCIT_B_01 } from './entities/NI_MCIT_B_01/steps/b01eccentricity_test.entity'
import { RepeatabilityTestNI_MCIT_B_01 } from './entities/NI_MCIT_B_01/steps/b01repeatability_test.entity'
import { LinearityTestNI_MCIT_B_01 } from './entities/NI_MCIT_B_01/steps/b01linearity_test.entity'
import { UnitOfMeasurementNI_MCIT_B_01 } from './entities/NI_MCIT_B_01/steps/b01unitOfMeasurement.entity'

import { NI_MCIT_T_03Service } from './ni-mcit-t-03.service'
import { NI_MCIT_T_03 } from './entities/NI_MCIT_T_03/NI_MCIT_T_03.entity'
import { EquipmentInformationNI_MCIT_T_03 } from './entities/NI_MCIT_T_03/steps/equipment_informatio.entity'
import { DescriptionPatternNI_MCIT_T_03 } from './entities/NI_MCIT_T_03/steps/description_pattern.entity'
import { CalibrationResultsNI_MCIT_T_03 } from './entities/NI_MCIT_T_03/steps/calibration_results.entity'
import { EnvironmentalConditionsNI_MCIT_T_03 } from './entities/NI_MCIT_T_03/steps/environmental_conditions.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Methods,

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
      PreInstallationCommentNI_MCIT_D_02,

      NI_MCIT_D_01,
      EquipmentInformationNI_MCIT_D_01,
      EnvironmentalConditionsNI_MCIT_D_01,
      DescriptionPatternNI_MCIT_D_01,
      PreInstallationCommentNI_MCIT_D_01,
      InstrumentZeroCheckNI_MCIT_D_01,
      ExteriorParallelismMeasurementNI_MCIT_D_01,
      InteriorParallelismMeasurementNI_MCIT_D_01,
      ExteriorMeasurementAccuracyNI_MCIT_D_01,

      NI_MCIT_T_01,
      EquipmentInformationNI_MCIT_T_01,
      CalibrationResultsNI_MCIT_T_01,
      EnvironmentalConditionsNI_MCIT_T_01,
      DescriptionPatternNI_MCIT_T_01,

      NI_MCIT_M_01,
      EquipmentInformationNI_MCIT_M_01,
      DataNI_MCIT_M_01,

      NI_MCIT_B_01,
      EnvironmentalConditionsNI_MCIT_B_01,
      EquipmentInformationNI_MCIT_B_01,
      EccentricityTestNI_MCIT_B_01,
      RepeatabilityTestNI_MCIT_B_01,
      LinearityTestNI_MCIT_B_01,
      UnitOfMeasurementNI_MCIT_B_01,

      NI_MCIT_T_03,
      EquipmentInformationNI_MCIT_T_03,
      DescriptionPatternNI_MCIT_T_03,
      CalibrationResultsNI_MCIT_T_03,

    ]),
    forwardRef(() => ActivitiesModule),
    forwardRef(() => QuotesModule),
    forwardRef(() => CertificateModule),
    forwardRef(() => PatternsModule),
  ],
  controllers: [MethodsController],
  providers: [
    MethodsService,
    NI_MCIT_P_01Service,
    NI_MCIT_D_02Service,
    NI_MCIT_D_01Service,
    NI_MCIT_T_01Service,
    NI_MCIT_M_01Service,
    NI_MCIT_B_01Service,
    NI_MCIT_T_03Service,
    PdfService,
    MailService,
    TokenService,
  ],
  exports: [MethodsService],
})
export class MethodsModule {}
