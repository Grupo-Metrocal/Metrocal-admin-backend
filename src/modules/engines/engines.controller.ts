import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { EnginesService } from './engines.service'
import {
  handleBadrequest,
  handleInternalServerError,
  handleOK,
} from 'src/common/handleHttp'
import * as path from 'path'
import * as fs from 'fs'
import { Response } from 'express'
import { ApiTags } from '@nestjs/swagger'

@ApiTags('engines')
@Controller('engines')
export class EnginesController {
  constructor(private readonly enginesService: EnginesService) {}

  @Get('calibration_method/:method')
  async getAllPatternsByMethod(@Param('method') method: string) {
    return await this.enginesService.getEnginesByCalibrationMethod(method)
  }

  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: `${process.env.DESTINATION_CLOUD}/alternative-excel-engine`,
        filename: (req, file, cb) => {
          const filename: string = `${file.originalname}`
          cb(null, filename)
        },
      }),
    }),
  )
  @Post('upload/alternative-engine/engineId/:id')
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('id') id: number,
  ) {
    if (!file) {
      return handleBadrequest(new Error('File is required'))
    }
    await this.enginesService.setAlternativePath(id, file.filename)

    return handleOK({
      fileURL: file.filename,
    })
  }

  @Get('download_intern_excel_engine/path/:path_file/')
  async downloadInternExcelEngine(
    @Param('path_file') path_file: string,
    @Res() res: Response,
  ) {
    try {
      const filePath = path.join(__dirname, path_file)

      if (!fs.existsSync(filePath)) {
        return res.status(404).send('File not found')
      }

      const stat = fs.statSync(filePath)

      res.set({
        'Content-Disposition': `attachment; filename=${'intern_excel_engine.xlsx'}`,
        'Content-Type': 'application/octet-stream',
        'Content-Length': stat.size.toString(),
      })

      const readStream = fs.createReadStream(filePath)
      readStream.pipe(res)
    } catch (error) {
      res.status(500).send('Internal server error')
    }
  }

  @Get('download/:filename')
  async downloadFile(
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    try {
      const filePath = path.join(
        process.env.DESTINATION_CLOUD,
        'alternative-excel-engine',
        filename,
      )

      if (!fs.existsSync(filePath)) {
        return res.status(404).send('File not found')
      }

      const stat = fs.statSync(filePath)

      res.set({
        'Content-Type': 'application/octet-stream',
        'Content-Length': stat.size.toString(),
        'Content-Disposition': `attachment; filename=${filename}`,
      })

      const readStream = fs.createReadStream(filePath)
      readStream.pipe(res)
    } catch (error) {
      res.status(500).send('Internal server error')
    }
  }

  @Get('delete/engineId/:id/file_name/:filename')
  async deleteFile(
    @Param('id') id: number,
    @Param('filename') filename: string,
  ) {
    try {
      const filePath = path.join(
        process.env.DESTINATION_CLOUD,
        'alternative-excel-engine',
        filename,
      )

      if (!fs.existsSync(filePath)) {
        return handleInternalServerError('File not found')
      }

      await this.enginesService.deleteAlternativePath(id)

      fs.unlinkSync(filePath)

      return handleOK('File deleted')
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }
}
