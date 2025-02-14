import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Engine } from './entities/engine.entity'
import { Repository } from 'typeorm'
import { handleInternalServerError, handleOK } from 'src/common/handleHttp'
import * as EngineJSON from './engines.json'
import * as path from 'path'

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

    if (engine?.alternative_path) {
      return `${path.join(
        process.env.DESTINATION_CLOUD,
        'alternative-excel-engine',
        engine?.alternative_path,
      )}`
    }

    return path.join(__dirname, engine?.default_path)
  }

  async getEnginesByCalibrationMethod(calibration_method: string) {
    try {
      const engines = await this.engineRepository.find({
        where: [
          {
            calibration_method,
          },
        ],
      })

      return handleOK(engines)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async setAlternativePath(id: number, path: string) {
    try {
      const engine = await this.engineRepository.findOne({
        where: { id },
      })

      if (!engine) {
        return handleInternalServerError('Engine not found')
      }

      engine.alternative_path = path

      await this.engineRepository.save(engine)

      return handleOK('Path alternativo guardado correctamente')
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async deleteAlternativePath(id: number) {
    try {
      const engine = await this.engineRepository.findOne({
        where: { id },
      })

      if (!engine) {
        return handleInternalServerError('Engine not found')
      }

      engine.alternative_path = null

      await this.engineRepository.save(engine)

      return handleOK('Path alternativo eliminado correctamente')
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }
}
