import { Module } from '@nestjs/common'
import { ActivitiesService } from './activities.service'
import { ActivitiesController } from './activities.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Activity } from './entities/activities.entity'
import { User } from '../users/entities/user.entity'
import { QuoteRequest } from '../quotes/entities/quote-request.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Activity, User, QuoteRequest])],
  controllers: [ActivitiesController],
  providers: [ActivitiesService],
})
export class ActivitiesModule {}
