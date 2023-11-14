import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { EquipmentRegister, IvaRegister} from './entities/configuration.entity'
import { ConfigurationService } from './configurations.service'
import { ConfigurationController } from './configurations.controller'

@Module({
  imports: [
    TypeOrmModule.forFeature([EquipmentRegister,IvaRegister])
    
  ],
  controllers: [ConfigurationController],
  providers: [ConfigurationService, EquipmentRegister],
  exports: [ConfigurationService, EquipmentRegister],
})
export class ConfigurationModule {}