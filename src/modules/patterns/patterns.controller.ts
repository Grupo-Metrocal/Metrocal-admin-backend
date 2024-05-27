import { Controller, Post, Body, Param, Get } from '@nestjs/common'
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

  @Get('')
  async getAll() {
    return await this.patternsService.getAll()
  }
}
