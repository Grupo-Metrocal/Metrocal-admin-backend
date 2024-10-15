import { Controller, Post, Body, Param, Get, Put, Delete } from '@nestjs/common'
import { PatternsService } from './patterns.service'
import { ApiTags } from '@nestjs/swagger'
import { UseGuards } from '@nestjs/common'
import { CreatePatternDto } from './dto/create-patter.dto'

@ApiTags('patterns')
@Controller('patterns')
export class PatternsController {
  constructor(private readonly patternsService: PatternsService) {}

  @Post()
  async createPattern(@Body() pattern: CreatePatternDto) {
    return await this.patternsService.createPattern(pattern)
  }

  @Put(':pattern_id')
  async remove(@Param('pattern_id') pattern_id: number) {
    return await this.patternsService.remove(pattern_id)
  }

  @Get(':pattern_id')
  async findById(@Param('pattern_id') pattern_id: number) {
    return await this.patternsService.findById(pattern_id)
  }

  @Get(':pattern_code')
  async findByCode(@Param('pattern_code') pattern_code: string) {
    return await this.patternsService.findByCode(pattern_code)
  }

  @Put(':pattern_id')
  async update(@Param('pattern_id') pattern_id: number, @Body() updatePatternDto: CreatePatternDto) {
    return await this.patternsService.update(pattern_id, updatePatternDto)
  }

  @Delete('')
  async removeAll() {
    return await this.patternsService.deleteAllRecords()
  }

  @Get('')
  async getAll() {
    return await this.patternsService.getAll()
  }
}

