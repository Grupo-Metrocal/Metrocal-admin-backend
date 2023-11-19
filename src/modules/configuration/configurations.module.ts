import { Injectable, Module, OnApplicationBootstrap, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { EquipmentRegister} from './entities/configuration.entity'
import { ConfigurationService } from './configurations.service'
import { ConfigurationController } from './configurations.controller'

@Module({
  imports: [
    TypeOrmModule.forFeature([EquipmentRegister])
    
  ],
  controllers: [ConfigurationController],
  providers: [ConfigurationService, EquipmentRegister],
  exports: [ConfigurationService, EquipmentRegister],
  
})
export class ConfigurationModule {}

@Injectable()
export class ConfigInitializer implements OnApplicationBootstrap {
  constructor(private readonly configService: ConfigurationService){}

  async init(){
    await this.configService.createDefaultData()
  }
  
  onApplicationBootstrap() {
     this.configService.createDefaultData()
  }
}
