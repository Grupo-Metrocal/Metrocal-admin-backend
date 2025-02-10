import { Controller, Post, Body, Param, Get, Put, Delete } from '@nestjs/common'
import { PatternsService } from './patterns.service'
import { ApiTags } from '@nestjs/swagger'
import { UseGuards } from '@nestjs/common'
import { CreatePatternDto } from './dto/create-patter.dto'
import { IMethods } from '../methods/entities/method.entity'
import { Pattern } from './entities/pattern.entity'

@ApiTags('patterns')
@Controller('patterns')
export class PatternsController {
  constructor(private readonly patternsService: PatternsService) {}

  @Post()
  async createPattern(@Body() pattern: CreatePatternDto) {
    return await this.patternsService.createPattern(pattern)
  }

  @Delete('pattern_id/:pattern_id')
  async remove(@Param('pattern_id') pattern_id: number) {
    return await this.patternsService.remove(pattern_id)
  }

  @Get(':pattern_id')
  async findById(@Param('pattern_id') pattern_id: number) {
    return await this.patternsService.findById(pattern_id)
  }

  @Get('calibration_method/:method')
  async getAllPatternsByMethod(@Param('method') method: IMethods) {
    return await this.patternsService.getAllPatternByMethod(method)
  }

  @Post('update')
  async update(@Body() updatePatternDto: Pattern) {
    return await this.patternsService.update(updatePatternDto)
  }

  @Get('update-status/pattern_id/:id')
  async removeAll(@Param('id') id: number) {
    return await this.patternsService.updateStatus(id)
  }

  @Get('')
  async getAll() {
    return await this.patternsService.getAll()
  }
}
