import { Injectable, Module, OnApplicationBootstrap, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Configuration, EquipmentRegister} from './entities/configuration.entity'
import { ConfigurationService } from './configurations.service'
import { ConfigurationController } from './configurations.controller'

@Module({
  imports: [
    TypeOrmModule.forFeature([EquipmentRegister,Configuration])
    
  ],
  controllers: [ConfigurationController],
  providers: [ConfigurationService, EquipmentRegister],
  exports: [ConfigurationService, EquipmentRegister],
  
})
export class ConfigurationModule {}

@Injectable()
export class ConfigInitializer implements OnApplicationBootstrap {
  constructor(private readonly configService: ConfigurationService){}
    
  onApplicationBootstrap() {
     this.configService.createDefaultData()
  }
}
