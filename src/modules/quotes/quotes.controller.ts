import { QuotesService } from './quotes.service'
import { ApiBody, ApiProperty, ApiQuery, ApiTags } from '@nestjs/swagger'
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
  UseInterceptors,
  UploadedFile,
  Put,
} from '@nestjs/common'
import { QuoteRequestDto } from './dto/quote-request.dto'
import { updateEquipmentQuoteRequestDto } from './dto/update-equipment-quote-request.dto'
import { UpdateQuoteRequestDto } from './dto/update-quote-request.dto'
import { ApprovedOrRejectedQuoteByClientDto } from './dto/change-status-quote-request.dto'
import { Response } from 'express'
import { handleBadrequest } from 'src/common/handleHttp'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { PaginationQueryDto } from './dto/pagination-query.dto'
import { ReviewEquipmentDto } from './dto/review-equipment.dto'
import { ModificationRequestDto } from './dto/modification-request.dto'
import { EquipmentQuoteRequestDto } from './dto/equipment-quote-request.dto'
import { DeleteEquipmentFromQuoteDto } from './dto/delete-equipment-from-quote.dto'
import { CurrencyType } from './entities/quote-request.entity'
import { FileInterceptor } from '@nestjs/platform-express'
import { ParameterIdDto } from './dto/parameter-id.dto'

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
    return await this.quotesService.getAll({ filterActive: true })
  }

  @UseGuards(JwtAuthGuard)
  @Get('get-request-modify')
  async getAllRequestModify() {
    return await this.quotesService.getAllRequestModify()
  }

  @Get('request/all')
  async getAllQuoteRequest(@Query() pagination?: PaginationQueryDto) {
    if (isNaN(pagination.limit) || isNaN(pagination.offset)) {
      return handleBadrequest(new Error('Limit y offset deben ser numeros'))
    }

    return await this.quotesService.getAllQuoteRequest(pagination)
  }

  @Post('request/reject')
  async rejectQuoteRequest(@Body() body: ParameterIdDto) {
    return await this.quotesService.rejectQuoteRequest(body.id)
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

  @UseGuards(JwtAuthGuard)
  @ApiQuery({ name: 'increase', required: false })
  @Post('request/update/')
  async updateStatusQuoteRequest(
    @Body() quoteRequest: UpdateQuoteRequestDto,
    @Query('increase') increase?: string,
  ) {
    const valueIncrease = increase === 'true' ? true : false

    return await this.quotesService.updateStatusQuoteRequest(
      quoteRequest,
      valueIncrease,
    )
  }

  @Post('request/rejected-review')
  async rejectQuoteUnderReview(@Body() quoteRequest: UpdateQuoteRequestDto) {
    return await this.quotesService.rejectQuoteUnderReview(quoteRequest)
  }

  @Get('request/token/:token')
  async getQuoteRequestByToken(@Param('token') token: string) {
    if (!token) {
      return handleBadrequest(new Error('Token is required'))
    }

    return await this.quotesService.getQuoteRequestByToken(token)
  }

  @Get('request/pdf/:id')
  async getQuoteRequestPdf(@Param('id') id: number, @Res() res: Response) {
    const pdfBuffer = await this.quotesService.getQuoteRequestPdf(id)

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

  @Get('registered/all/:page/:limit/:no?')
  @UseGuards(JwtAuthGuard)
  @ApiQuery({ name: 'quoteRequestType', required: false, type: 'string' })
  async getQuoteRequestRegister(
    @Param('page') page: number,
    @Param('limit') limit: number,
    @Param('no') no: string,
    @Query('quoteRequestType') quoteRequestType?: string,
  ) {
    if (no === 'undefined' || no === undefined) {
      no = ''
    }

    if (quoteRequestType === 'undefined' || quoteRequestType === undefined) {
      quoteRequestType = ''
    }

    return await this.quotesService.getQuoteRequestRegister({
      page,
      limit,
      quoteRequestType,
      no,
    })
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
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

  @UseGuards(JwtAuthGuard)
  @Get('recalculate/:id')
  async recalculateQuoteRequest(@Param('id') id: number) {
    return await this.quotesService.recalculateQuoteRequestPrice(id)
  }

  @Post('review/equipment/:id')
  async reviewEquipment(
    @Param('id') id: number,
    @Body() review: ReviewEquipmentDto,
  ) {
    return await this.quotesService.reviewEquipment(id, review)
  }

  @Get('request/client/:id/all/:page/:limit/:no?')
  @UseGuards(JwtAuthGuard)
  async getAllQuoteRequestByClientId(
    @Param('id') id: number,
    @Param('page') page: number,
    @Param('limit') limit: number,
    @Param('no') filter: string,
  ) {
    return await this.quotesService.getAllQuoteRequestByClientId(
      id,
      page,
      limit,
      filter,
    )
  }

  @Get('get-fluctuation-statistic')
  @UseGuards(JwtAuthGuard)
  async getFluctuationStatistic() {
    return await this.quotesService.getFluctuationStatistic()
  }

  @Post('request/modify')
  async quoteModificationRequest(@Body() quoteRequest: ModificationRequestDto) {
    return this.quotesService.quoteModificationRequest(quoteRequest)
  }

  @Get('equipment/resolved/:id')
  @UseGuards(JwtAuthGuard)
  async markAsResolvedEquipment(@Param('id') id: number) {
    return await this.quotesService.markAsResolvedEquipment(id)
  }

  @Post('add-equipment/:id')
  @UseGuards(JwtAuthGuard)
  async addEquipmentToQuoteRequest(
    @Param('id') id: number,
    @Body() equipment: EquipmentQuoteRequestDto,
  ) {
    return await this.quotesService.addEquipmentToQuoteRequest(id, equipment)
  }

  @Post('equipment/delete-from-quote')
  @UseGuards(JwtAuthGuard)
  async deleteEquipmentFromQuote(
    @Body() { equipmentID, quoteID }: DeleteEquipmentFromQuoteDto,
  ) {
    return this.quotesService.deleteEquipmentFromQuote({ quoteID, equipmentID })
  }

  @UseGuards(JwtAuthGuard)
  @Get('generate/by-quote-id/:id')
  async generateQuoteByQuoteId(@Param('id') id: number) {
    return await this.quotesService.generateQuoteByQuoteId(id)
  }

  @Get('request/pdf/:id/:index')
  async generatePDFFromModifiedQuoteList(
    @Param('id') id: number,
    @Param('index') index: number,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.quotesService.generatePDFromModifiedQuoteList(
      id,
      Number(index),
    )

    if (!pdfBuffer) {
      return res.status(500).send('Error al generar el PDF')
    }

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename=Cotizacion.pdf')
    res.send(pdfBuffer)
  }

  @Get('fetch-quotation-details')
  async fetchQuotationDetails() {
    return await this.quotesService.fetchQuotationDetails()
  }

  @Get('currency/change-type/:type/:id')
  async changeCurrencyType(
    @Param('type') type: CurrencyType,
    @Param('id') id: number,
  ) {
    return await this.quotesService.changeCurrencyType(id, type)
  }

  @Get('copy/:quoteId/:clientId')
  async copyQuote(
    @Param('clientId') clientId: number,
    @Param('quoteId') quoteId: number,
  ) {
    return await this.quotesService.copyQuote(quoteId, clientId)
  }

  @Post('create-service/generate-methods/:quoteId')
  async createMutateServiceAndGenerateMethods(
    @Param('quoteId') quoteId: number,
    @Body() equipment: EquipmentQuoteRequestDto,
  ) {
    return await this.quotesService.createMutateServiceAndGenerateMethods(
      quoteId,
      equipment,
    )
  }

  @Post('upload-to-extract')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return await this.quotesService.extractQuoteFromExcel(file)
  }

  @Post('disable-quote-service/:quoteId/:equipmentId')
  @UseGuards(JwtAuthGuard)
  async disableQuoteService(
    @Param('quoteId') quoteId: number,
    @Param('equipmentId') equipmentId: number,
  ) {
    return await this.quotesService.disableQuoteService(quoteId, +equipmentId)
  }
}
