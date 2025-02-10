import { Injectable } from '@nestjs/common'
import { handleRetry, InjectRepository } from '@nestjs/typeorm'
import { Pattern } from './entities/pattern.entity'
import { Repository } from 'typeorm'
import {
  handleBadrequest,
  handleInternalServerError,
  handleOK,
} from 'src/common/handleHttp'
import { CreatePatternDto } from './dto/create-patter.dto'
import * as PatternsJSON from './patterns.json'
import { IMethods } from '../methods/entities/method.entity'

@Injectable()
export class PatternsService {
  constructor(
    @InjectRepository(Pattern)
    private readonly patternRepository: Repository<Pattern>,
  ) {}

  async remove(id: number) {
    const patternFound = await this.patternRepository.findOne({
      where: { id },
    })

    if (!patternFound) {
      return handleBadrequest(new Error('El patrón no existe'))
    }

    try {
      const patternRemoved = await this.patternRepository.remove(patternFound)
      return handleOK(patternRemoved)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async update(pattern: Pattern) {
    try {
      const patternFound = await this.patternRepository.findOne({
        where: {
          id: pattern.id,
        },
      })

      if (!patternFound) {
        return handleBadrequest(new Error('El patron no existe'))
      }

      const patternUpdated = this.patternRepository.merge(patternFound, pattern)
      const patternSaved = await this.patternRepository.save(patternUpdated)
      return handleOK(patternSaved)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async createPattern(pattern: CreatePatternDto) {
    const patternFound = await this.patternRepository.findOne({
      where: { code: pattern.code },
    })

    if (patternFound) {
      return handleBadrequest(new Error('El patron ya existe'))
    }

    try {
      const patternCreated = await this.patternRepository.save(pattern)
      return handleOK(patternCreated)
    } catch (error) {
      return handleInternalServerError(error)
    }
  }

  async findById(id: number) {
    const pattern = await this.patternRepository.findOne({
      where: { id },
    })

    if (!pattern) {
      return handleBadrequest(new Error('El patron no existe, verifique el id'))
    }

    return handleOK(pattern)
  }

  async getAllPatternByMethod(method: IMethods) {
    const pattern = await this.patternRepository.find({
      where: { method },
    })

    if (!pattern) {
      return handleBadrequest(
        new Error('El metodo no existe, verifique porfavor'),
      )
    }

    return handleOK(pattern)
  }

  async findByCodeAndMethod(code: string, method: string) {
    try {
      const pattern = await this.patternRepository
        .createQueryBuilder('pattern')
        .where('pattern.code = :code', { code })
        .andWhere('pattern.method = :method', { method })
        .getOne()

      if (!pattern) {
        return handleBadrequest(new Error('El patron no existe'))
      }

      return handleOK(pattern)
    } catch (error) {
      return handleInternalServerError(error)
    }
  }

  async getAll() {
    try {
      const patterns = await this.patternRepository.find()

      if (!patterns.length) {
        return handleBadrequest(new Error('No hay patrones registrados'))
      }

      return handleOK(patterns)
    } catch (error) {
      return handleInternalServerError(error)
    }
  }

  async createDefaultPatterns() {
    try {
      const patterns = PatternsJSON.map((pattern) => {
        const {
          method,
          equipment,
          code,
          certificate,
          traceability,
          pattern_range,
          next_calibration,
          brand,
        } = pattern
        return this.patternRepository.create({
          method: method as any,
          equipment,
          code,
          certificate,
          traceability,
          pattern_range,
          next_calibration,
          brand: brand,
        })
      })

      for (const pattern of patterns) {
        const ifExist = await this.patternRepository.findOne({
          where: { code: pattern.code, method: pattern.method },
        })
        if (!ifExist) {
          await this.patternRepository.save(pattern)
        }
      }

      return handleOK(patterns)
    } catch (error) {
      return handleInternalServerError(error)
    }
  }

  async updateStatus(id: number) {
    try {
      const patternFound = await this.patternRepository.findOne({
        where: { id },
      })

      if (!patternFound) {
        return handleBadrequest(new Error('El patrón no existe'))
      }

      patternFound.status = !patternFound.status

      const patternSaved = await this.patternRepository.save(patternFound)

      return handleOK(patternSaved)
    } catch (error) {
      return handleInternalServerError(error)
    }
  }
}
