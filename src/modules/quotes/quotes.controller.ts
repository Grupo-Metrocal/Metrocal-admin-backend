import { QuotesService } from './quotes.service'
import { ApiProperty, ApiTags } from '@nestjs/swagger'
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Res,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common'
import { QuoteRequestDto } from './dto/quote-request.dto'
import { updateEquipmentQuoteRequestDto } from './dto/update-equipment-quote-request.dto'
import { UpdateQuoteRequestDto } from './dto/update-quote-request.dto'
import { ApprovedOrRejectedQuoteByClientDto } from './dto/change-status-quote-request.dto'
import { Response } from 'express'
import { handleBadrequest } from 'src/common/handleHttp'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { PaginationQueryDto } from './dto/pagination-query.dto'
import { PaginationQueryDinamicDto } from './dto/pagination-dinamic.dto'

@ApiTags('quotes')
@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Post('request')
  async createQuoteRequest(@Body() quoteRequestDto: QuoteRequestDto) {
    quoteRequestDto.status = 'pending'
    return await this.quotesService.createQuoteRequest(quoteRequestDto)
  }

  @UseGuards(JwtAuthGuard)
  @Get('')
  async getAll() {
    return await this.quotesService.getAll()
  }

  @Get('request/all')
  async getAllQuoteRequest(@Query() pagination?: PaginationQueryDto) {
    if (isNaN(pagination.limit) || isNaN(pagination.offset)) {
      return handleBadrequest(new Error('Limit y offset deben ser numeros'))
    }

    return await this.quotesService.getAllQuoteRequest(pagination)
  }

  @Post('request/reject')
  async rejectQuoteRequest(@Body() id: number) {
    return await this.quotesService.rejectQuoteRequest(id)
  }

  @UseGuards(JwtAuthGuard)
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

  @Get('request/pdf/:id')
  async getQuoteRequestPdf(@Param('id') id: number, @Res() res: Response) {
    const pdfBuffer = await this.quotesService.getQuoteRequestPdf(
      'approved_quote_request.hbs',
      id,
    )

    if (!pdfBuffer) {
      return res.status(500).send('Error al generar el PDF')
    }

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename=Cotizacion.pdf')
    res.send(pdfBuffer)
  }

  @Post('request/approved-rejected/client')
  async approvedOrRejectedQuoteByClient(
    @Body() quoteRequest: ApprovedOrRejectedQuoteByClientDto,
  ) {
    if (!quoteRequest) {
      return false
    }

    return await this.quotesService.approvedOrRejectedQuoteByClient(
      quoteRequest,
    )
  }

  //Pagintaion and filters for registered quotes
  @Get('registered/all')
  async getQuoteRequestRegister(@Query() pagination?: PaginationQueryDinamicDto) {
    if (isNaN(pagination.limit) || isNaN(pagination.offset)) {
      return handleBadrequest(new Error('Limit y offset deben ser numeros'))
    }
    return await this.quotesService.getQuoteRequestRegister(pagination)
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    return await this.quotesService.deleteQuoteRequest(id)
  }

  @UseGuards(JwtAuthGuard)
  @Get('request/:id/remember')
  async rememberQuoteRequest(@Param('id') id: number) {
    if (!id) {
      return handleBadrequest(new Error('Id is required'))
    }
    return await this.quotesService.rememberQuoteRequest(id)
  }

  @UseGuards(JwtAuthGuard)
  @Get('request/monthly/graphic/:lastMonths')
  async GetMonthlyQuoteRequests(@Param('lastMonths') lastMonths: number) {
    return await this.quotesService.GetMonthlyQuoteRequests(lastMonths)
  }

  @UseGuards(JwtAuthGuard)
  @Get('get-by-status/:status')
  async getQuoteRequestByStatus(@Param('status') status: string) {
    return await this.quotesService.getQuoteRequestByStatus(status)
  }
}
