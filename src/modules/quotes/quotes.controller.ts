import { QuotesService } from './quotes.service'
import { ApiTags } from '@nestjs/swagger'
import { Controller, Post, Body, Get, Param } from '@nestjs/common'
import { QuoteRequestDto } from './dto/quote-request.dto'
import { updateEquipmentQuoteRequestDto } from './dto/update-equipment-quote-request.dto'
import { UpdateQuoteRequestDto } from './dto/update-quote-request.dto'

@ApiTags('quotes')
@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Post('request')
  async createQuoteRequest(@Body() quoteRequestDto: QuoteRequestDto) {
    quoteRequestDto.status = 'pending'
    return await this.quotesService.createQuoteRequest(quoteRequestDto)
  }

  @Get('request/all')
  async getAllQuoteRequest() {
    return await this.quotesService.getAllQuoteRequest()
  }

  @Post('request/reject')
  async rejectQuoteRequest(@Body() id: number) {
    return await this.quotesService.rejectQuoteRequest(id)
  }

  @Get('request/:id')
  async getQuoteRequestById(@Param('id') id: number) {
    return await this.quotesService.getQuoteRequestById(id)
  }
  @Get('request/client/:id')
  async getQuoteRequestByClientId(@Param('id') id: number) {
    return await this.quotesService.getQuoteRequestByClientId(id)
  }

  @Post('request/equipment/update/')
  async updateEquipmentQuoteRequest(
    @Body() equipmentQuoteRequest: updateEquipmentQuoteRequestDto,
  ) {
    return await this.quotesService.updateEquipmentQuoteRequest(
      equipmentQuoteRequest,
    )
  }

  @Post('request/update/')
  async updateStatusQuoteRequest(@Body() quoteRequest: UpdateQuoteRequestDto) {
    return await this.quotesService.updateStatusQuoteRequest(quoteRequest)
  }

  @Get('request/token/:token')
  async getQuoteRequestByToken(@Param('token') token: string) {
    if (!token) {
      return false
    }

    return await this.quotesService.getQuoteRequestByToken(token)
  }
}
