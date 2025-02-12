import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Engine } from './entities/engine.entity'
import { Repository } from 'typeorm'
import { handleInternalServerError, handleOK } from 'src/common/handleHttp'
import * as EngineJSON from './engines.json'

@Injectable()
export class EnginesService {
  constructor(
    @InjectRepository(Engine)
    private readonly engineRepository: Repository<Engine>,
  ) {}

  async createDefaultEngines() {
    try {
      const engines = EngineJSON.map((engine: Engine) =>
        this.engineRepository.create(engine),
      )

      for (const engine of engines) {
        const ifExist = await this.engineRepository.findOne({
          where: [
            {
              calibration_method: engine.calibration_method,
              pattern: engine.pattern,
            },
          ],
        })

        if (!ifExist) {
          await this.engineRepository.save(engine)
        }
      }

      return handleOK('Motores creados correctamente')
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async getPathByCalibrationMethodAndPattern(
    calibration_method: string,
    pattern?: string,
  ) {
    const engine = await this.engineRepository.findOne({
      where: [
        {
          calibration_method,
          pattern,
        },
      ],
    })

    return engine?.alternative_path || engine?.default_path
  }
}
