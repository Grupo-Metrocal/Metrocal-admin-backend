import {
  Injectable,
  Module,
  OnApplicationBootstrap,
  forwardRef,
} from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Configuration } from './entities/configuration.entity'
import { AuthorizedServices } from './entities/authorized_services.entity'
import { ConfigurationService } from './configurations.service'
import { ConfigurationController } from './configurations.controller'

@Module({
  imports: [TypeOrmModule.forFeature([AuthorizedServices, Configuration])],
  controllers: [ConfigurationController],
  providers: [ConfigurationService, AuthorizedServices],
  exports: [ConfigurationService, AuthorizedServices],
})
export class ConfigurationModule {}

@Injectable()
export class ConfigInitializer implements OnApplicationBootstrap {
  constructor(private readonly configService: ConfigurationService) {}

  onApplicationBootstrap() {
    this.configService.createDefaultData()
  }
}
