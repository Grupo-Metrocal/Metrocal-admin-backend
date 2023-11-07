import { Module, forwardRef } from '@nestjs/common'
import { ActivitiesService } from './activities.service'
import { ActivitiesController } from './activities.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Activity } from './entities/activities.entity'
import { QuotesModule } from '../quotes/quotes.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Activity]),
    forwardRef(() => QuotesModule),
  ],
  controllers: [ActivitiesController],
  providers: [ActivitiesService],
  exports: [ActivitiesService],
})
export class ActivitiesModule {}
