import { Injectable, Inject, forwardRef } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, DataSource } from 'typeorm'
import { Configuration } from './entities/configuration.entity'
import { handleInternalServerError, handleOK } from 'src/common/handleHttp'
import { CreateConfigurationDto } from './dto/configuration.dto'

@Injectable()
export class ConfigurationService {
  constructor(
    @InjectRepository(Configuration)
    private readonly configurationRepositori: Repository<Configuration>,
    private readonly dataSource: DataSource,) {}

    async createConfiguration(Config: CreateConfigurationDto) {
        
        const newActivity = this.configurationRepositori.create({
          ...Config
        })
    
        
        try {
          await this.dataSource.transaction(async (manager) => {
            await manager.save(newActivity)
            
          })
    
          return handleOK(newActivity)
        } catch (error) {
          return handleInternalServerError(error.message)
        }
      }

    async findAll(){
        return await this.configurationRepositori.find()
    }
    

 
}