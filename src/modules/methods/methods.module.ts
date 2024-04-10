import { Module, forwardRef } from '@nestjs/common'
import { MethodsService } from './methods.service'

import { MethodsController } from './methods.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ActivitiesModule } from '../activities/activities.module'
import { QuotesModule } from '../quotes/quotes.module'
import { Methods } from './entities/method.entity'
import { CertificateModule } from '../certificate/certificate.module'

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

import { NI_MCIT_D_01Service } from './ni-mcit-d-01.service'
import { NI_MCIT_D_01 } from './entities/NI_MCIT_D_01/NI_MCIT_D_01.entity'
import { EquipmentInformationNI_MCIT_D_01 } from './entities/NI_MCIT_D_01/steps/equipment_informatio.entity'
import { EnvironmentalConditionsNI_MCIT_D_01 } from './entities/NI_MCIT_D_01/steps/environmental_conditions.entity'
import { DescriptionPatternNI_MCIT_D_01 } from './entities/NI_MCIT_D_01/steps/description_pattern.entity'
import { PreInstallationCommentNI_MCIT_D_01 } from './entities/NI_MCIT_D_01/steps/pre_installation_comment.entity'
import { InstrumentZeroCheckNI_MCIT_D_01 } from './entities/NI_MCIT_D_01/steps/instrument_zero_check.entity'
import { ExteriorParallelismMeasurementNI_MCIT_D_01 } from './entities/NI_MCIT_D_01/steps/exterior_parallelism_measurement.entity'
import { InteriorParallelismMeasurementNI_MCIT_D_01 } from './entities/NI_MCIT_D_01/steps/interior_parallelism_measurement.entity'
import { ExteriorMeasurementAccuracyNI_MCIT_D_01 } from './entities/NI_MCIT_D_01/steps/exterior_measurement_accuracy.entity'
import { PdfService } from '../mail/pdf.service'
import { MailService } from '../mail/mail.service'

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
    ]),
    forwardRef(() => ActivitiesModule),
    forwardRef(() => QuotesModule),
    forwardRef(() => CertificateModule),
  ],
  controllers: [MethodsController],
  providers: [
    MethodsService,
    NI_MCIT_P_01Service,
    NI_MCIT_D_02Service,
    NI_MCIT_D_01Service,
    PdfService,
    MailService,
  ],
  exports: [MethodsService],
})
export class MethodsModule {}
