import { Module, forwardRef } from '@nestjs/common'
import { ActivitiesService } from './activities.service'
import { ActivitiesController } from './activities.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Activity } from './entities/activities.entity'
import { QuotesModule } from '../quotes/quotes.module'
import { User } from '../users/entities/user.entity'
import { MethodsModule } from '../methods/methods.module'
import { PdfService } from '../mail/pdf.service'
import { MailService } from '../mail/mail.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([Activity, User]),
    forwardRef(() => QuotesModule),
    forwardRef(() => MethodsModule),
  ],
  controllers: [ActivitiesController],
  providers: [ActivitiesService, PdfService, MailService],
  exports: [ActivitiesService],
})
export class ActivitiesModule {}
