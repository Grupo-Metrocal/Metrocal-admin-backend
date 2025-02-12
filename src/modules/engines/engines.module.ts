import { Module } from '@nestjs/common'
import { EnginesService } from './engines.service'
import { EnginesController } from './engines.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Engine } from './entities/engine.entity'
import { EngineInitializerService } from './engines.initializer.service'

@Module({
  imports: [TypeOrmModule.forFeature([Engine])],
  controllers: [EnginesController],
  providers: [EnginesService, EngineInitializerService],
  exports: [EnginesService],
})
export class EnginesModule {}
