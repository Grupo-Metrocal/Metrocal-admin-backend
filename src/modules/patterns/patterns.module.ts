import { Module } from '@nestjs/common'
import { PatternsService } from './patterns.service'
import { PatternsController } from './patterns.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Pattern } from './entities/pattern.entity'
import { PatternsInitializerService } from './patterns.initializer.service'

@Module({
  imports: [TypeOrmModule.forFeature([Pattern])],
  controllers: [PatternsController],
  providers: [PatternsService, PatternsInitializerService],
  exports: [PatternsService],
})
export class PatternsModule {}
