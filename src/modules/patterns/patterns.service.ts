import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Pattern } from './entities/pattern.entity'
import { Repository } from 'typeorm'
import {
  handleBadrequest,
  handleInternalServerError,
  handleOK,
} from 'src/common/handleHttp'
import { CreatePatternDto } from './dto/create-patter.dto'
import * as PatternsJSON from './patterns.json'

@Injectable()
export class PatternsService {
  constructor(
    @InjectRepository(Pattern)
    private readonly patternRepository: Repository<Pattern>,
  ) {}

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
    const patterns = PatternsJSON.map((pattern) => {
      const {
        method,
        equipment,
        code,
        certificate,
        traceability,
        pattern_range,
        next_calibration,
      } = pattern
      return this.patternRepository.create({
        method: method as any,
        equipment,
        code,
        certificate,
        traceability,
        pattern_range,
        next_calibration,
      })
    })

    try {
      console.log('Creating default patterns...')

      for (const pattern of patterns) {
        if (
          await this.patternRepository.findOne({
            where: { code: pattern.code },
          })
        )
          continue

        await this.patternRepository.save(pattern)
      }

      return handleOK(patterns)
    } catch (error) {
      return handleInternalServerError(error)
    }
  }

  async deleteAllRecords() {
    try {
      await this.patternRepository.delete({})
      return handleOK('All records deleted')
    } catch (error) {
      return handleInternalServerError(error)
    }
  }
}
