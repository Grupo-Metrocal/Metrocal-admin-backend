import { Inject, Injectable, forwardRef } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { GENERIC_METHOD } from "./entities/GENERIC METHOD/GENERIC_METHOD.entity";
import { EquipmentInformationGENERIC_METHODDto } from "./dto/GENERIC METHOD/equipment_information.dto";
import { EnvironmentalConditionsGENERIC_METHODDto } from "./dto/GENERIC METHOD/enviromental_condition.dto";
import { Result_MeditionGENERIC_METHODDto } from "./dto/GENERIC METHOD/result_medition.dto";
import { EnvironmentalConditionsGENERIC_METHOD } from "./entities/GENERIC METHOD/steps/enviromental_condition.entity";
import { handleInternalServerError, handleOK } from "src/common/handleHttp";
import { EquipmentInformationGENERIC_METHOD } from "./entities/GENERIC METHOD/steps/equipment_information.entity";
import { ComputerDataGENERIC_METHOD } from "./entities/GENERIC METHOD/steps/computer_data.entity";
import { ComputerDataGENERIC_METHODDto } from "./dto/GENERIC METHOD/computer_data.dto";
import { ResultMeditionGENERIC_METHOD } from "./entities/GENERIC METHOD/steps/result_medition.entity";
import { formatDate } from 'src/utils/formatDate'
import { PdfService } from '../mail/pdf.service'
import { MailService } from '../mail/mail.service'
import { MethodsService } from './methods.service'

import * as path from 'path'
import * as fs from 'fs'
import * as XlsxPopulate from 'xlsx-populate';
import { PatternsService } from "../patterns/patterns.service";
import { CertificateService } from "../certificate/certificate.service";
import { exec } from "child_process";
import { ActivitiesService } from "../activities/activities.service";

@Injectable()
export class GENERIC_METHODService {
  // Add your methods here
  constructor(
    private readonly dataSource : DataSource,
    @InjectRepository(GENERIC_METHOD)
    private readonly GENERIC_METHODRepository: Repository<GENERIC_METHOD>,

    @InjectRepository(EquipmentInformationGENERIC_METHOD) 
    private readonly equipmentInformationGENERIC_METHODRepository: Repository<EquipmentInformationGENERIC_METHOD>,

    @InjectRepository(EnvironmentalConditionsGENERIC_METHOD)
    private readonly environmentalConditionsGENERIC_METHODRepository: Repository<EnvironmentalConditionsGENERIC_METHOD>,

    @InjectRepository(ComputerDataGENERIC_METHOD)
    private readonly computerDataGENERIC_METHODRepository: Repository<ComputerDataGENERIC_METHOD>,
    
    @InjectRepository(ResultMeditionGENERIC_METHOD)
    private readonly resultMeditionGENERIC_METHODRepository: Repository<ResultMeditionGENERIC_METHOD>,
  
    @Inject(forwardRef(() => ActivitiesService))
    private activitiesService: ActivitiesService, 
    
    @Inject(forwardRef(() => PatternsService))
    private readonly patternsService: PatternsService,

    @Inject(forwardRef(() => CertificateService))
    private readonly certificateService: CertificateService,

    @Inject(forwardRef(() => PdfService))
    private readonly pdfService: PdfService,

    @Inject(forwardRef(() => MailService))
    private readonly mailService: MailService,

    @Inject(forwardRef(() => MethodsService))
    private readonly methodService: MethodsService,
  ) {}

  async create(){
    try {
      const newGENERIC_METHOD = this.GENERIC_METHODRepository.create();
      const method = await this.GENERIC_METHODRepository.save(newGENERIC_METHOD);
      return handleOK(method);
    }
    catch (error) {
      return handleInternalServerError(error.message);
    }
  }

  async equipmentInformationCreate(
    equipement : EquipmentInformationGENERIC_METHODDto,
    methodId : number,
  ){
    try {
      const method = await this.GENERIC_METHODRepository.findOne({
        where: { id: methodId },
        relations: ['equipment_information']
      })
        if (!method) {
            return handleInternalServerError('Method not found');
        }
        const existingEquipment = method.equipment_information;

        if (existingEquipment) {
           this.equipmentInformationGENERIC_METHODRepository.merge(
            existingEquipment,
            equipement
           )
        }else{
            const newEquipment = 
            this.equipmentInformationGENERIC_METHODRepository.create(equipement);
            method.equipment_information = newEquipment;         
          }

          await this.generateCertificateCodeToMethod(method.id)

          await this.dataSource.transaction(async (manager) => {
            await manager.save(method.equipment_information);
            await manager.save(method);
          });
          return handleOK(method.equipment_information);
    }
    catch (error) {
      return handleInternalServerError(error.message);
    }
  }

  async environmentalConditionsCreate(
    environmentalConditions : EnvironmentalConditionsGENERIC_METHODDto,
    methodId : number,
  ){
    try {
      const method = await this.GENERIC_METHODRepository.findOne({
        where: { id: methodId },
        relations: ['environmental_conditions']
      })
        if (!method) {
            return handleInternalServerError('Method not found');
        }
        const existingEnvironmentalConditions = method.environmental_conditions;

        if (existingEnvironmentalConditions) {
           this.environmentalConditionsGENERIC_METHODRepository.merge(
            existingEnvironmentalConditions,
            environmentalConditions
           )
        }else{
            const newEnvironmentalConditions = 
            this.environmentalConditionsGENERIC_METHODRepository.create(environmentalConditions);
            method.environmental_conditions = newEnvironmentalConditions;         
          }

          await this.dataSource.transaction(async (manager) => {
            await manager.save(method.environmental_conditions);
            await manager.save(method);
          });
          return handleOK(method.environmental_conditions);
    }
    catch (error) {
      return handleInternalServerError(error.message);
    }
  }

  async computerDataCreate(
    computerData : ComputerDataGENERIC_METHODDto,
    methodId : number,
  ){
    try {
      const method = await this.GENERIC_METHODRepository.findOne({
        where: { id: methodId },
        relations: ['computer_data']
      })
        if (!method) {
            return handleInternalServerError('Method not found');
        }
        const existingComputerData = method.computer_data;

        if (existingComputerData) {
           this.computerDataGENERIC_METHODRepository.merge(
            existingComputerData,
            computerData
           )
        }else{
            const newComputerData = 
            this.computerDataGENERIC_METHODRepository.create(computerData);
            method.computer_data = newComputerData;         
          }

          await this.dataSource.transaction(async (manager) => {
            await manager.save(method.computer_data);
            await manager.save(method);
          });
          return handleOK(method.computer_data);
    }
    catch (error) {
      return handleInternalServerError(error.message);
    }
  }

  async resultMeditionCreate(
    resultMedition : Result_MeditionGENERIC_METHODDto,
    methodId : number,
  ){
    try {
      const method = await this.GENERIC_METHODRepository.findOne({
        where: { id: methodId },
        relations: ['result_medition']
      })
        if (!method) {
            return handleInternalServerError('Method not found');
        }
        const existingResultMedition = method.result_medition;

        if (existingResultMedition) {
           this.resultMeditionGENERIC_METHODRepository.merge(
            existingResultMedition,
            resultMedition
           )
        }else{
            const newResultMedition = 
            this.resultMeditionGENERIC_METHODRepository.create(resultMedition);
            method.result_medition = newResultMedition;         
          }

          await this.dataSource.transaction(async (manager) => {
            await manager.save(method.result_medition);
            await manager.save(method);
          });
          return handleOK(method.result_medition);
    }
    catch (error) {
      return handleInternalServerError(error.message);
    }
  }

  //get generate certificate 
  async generateCertificate({
    activityID,
    methodID,
  }:{
    activityID: number
    methodID: number
  }){
    const method = await this.GENERIC_METHODRepository.findOne({
      where: { id: methodID },
      relations: [
        'equipment_information', 
        'environmental_conditions',
        'computer_data', 
        'result_medition'],
    })

    if (!method) {
      return handleInternalServerError('El método no existe');
    }

    const { 
      equipment_information, 
      environmental_conditions,
      computer_data, 
      result_medition } = method;

      if(!equipment_information || 
        !environmental_conditions || 
        !computer_data || 
        !result_medition){
          return handleInternalServerError('Faltan datos para generar el certificado');
        }

    
    try{
      let filePath = path.join(
        __dirname,
        '../mail/templates/excels/method-generic.xlsx',
      )

      if(fs.existsSync(method.certificate_url)){
        fs.unlinkSync(method.certificate_url);
      }

      fs.copyFileSync(filePath, method.certificate_url);

      const workbook = await XlsxPopulate.fromFileAsync(method.certificate_url);

      const worksheetGenerales = workbook.sheet('Generales');
      const worksheetEntradaDatos = workbook.sheet('Entrada de Datos');
      
      //date
      worksheetGenerales.cell('C7').vaue(method.equipment_information.date);
      //device
      worksheetGenerales.cell('C9').value(method.equipment_information.device);
      //maker
      worksheetGenerales.cell('C11').value(method.equipment_information.maker);
      //serial_number
      worksheetGenerales.cell('C13').value(method.equipment_information.serial_number);
      //model
      worksheetGenerales.cell('C15').value(method.equipment_information.model);
      //measurement_range
      worksheetGenerales.cell('C17').value(method.equipment_information.measurement_range);
      //scale_interval
      worksheetGenerales.cell('C19').value(method.equipment_information.scale_interval);
      //code
      worksheetGenerales.cell('C21').value(method.equipment_information.code);
      //estabilization_site
      worksheetGenerales.cell('C27').value(method.equipment_information.estabilization_site);

      //temperature
      worksheetGenerales.cell('C30').value(method.environmental_conditions.temperature);
      //humidity
      worksheetGenerales.cell('C31').value(method.environmental_conditions.hr);

      let fila = 10;
      for(let i = fila; i < method.result_medition.medition.length; i++){
        worksheetEntradaDatos.cell(`A${fila}`).value(method.result_medition.medition[i].patron1);
        worksheetEntradaDatos.cell(`B${fila}`).value(method.result_medition.medition[i].equiopo1);
        worksheetEntradaDatos.cell(`C${fila}`).value(method.result_medition.medition[i].patron2);
        worksheetEntradaDatos.cell(`D${fila}`).value(method.result_medition.medition[i].equiopo2);
        worksheetEntradaDatos.cell(`E${fila}`).value(method.result_medition.medition[i].patron3);
        worksheetEntradaDatos.cell(`F${fila}`).value(method.result_medition.medition[i].equiopo3);
        fila++;
      }

      worksheetEntradaDatos.cell('C2').value(method.computer_data.scale_unit);
      worksheetEntradaDatos.cell('C3').value(method.computer_data.unit_of_measurement);
      worksheetEntradaDatos.cell('C4').value(method.environmental_conditions.equipment_used);

      workbook.toFileAsync(method.certificate_url)
      await this.autoSaveExcel(method.certificate_url)

      return this.getCertificateResult(method.id, activityID)
    }catch(error){
      return handleInternalServerError(error.message);
    }
  }

  async getCertificateResult(methodID: number, activityID: number)
  {
    try{
      const method = await this.GENERIC_METHODRepository.findOne({
        where: { id: methodID },
        relations: [
          'equipment_information', 
          'environmental_conditions',
          'computer_data', 
          'result_medition'],
      })

      if (!method) {
        return handleInternalServerError('El método no existe');
      }

      const { 
        equipment_information, 
        environmental_conditions,
        computer_data, 
        result_medition } = method;

        if(!equipment_information || 
          !environmental_conditions || 
          !computer_data || 
          !result_medition){
            return handleInternalServerError('Faltan datos para generar el certificado');
          }

      const dataActivity = await this.activitiesService.getActivitiesByID(activityID);

      if(!dataActivity){
        return handleInternalServerError('La actividad no existe');
      }

      const activity = dataActivity.data;
      const reopnedWorkbook = await XlsxPopulate.fromFileAsync(method.certificate_url);
      const worksheetFa1pto = reopnedWorkbook.sheet('FA  1 pto');
      
      


   
    }catch(error){
      return handleInternalServerError(error.message);
    }
  }

  async autoSaveExcel(filePath: string) {
    return new Promise((resolve, reject) => {
      // save excel file from powershell

      const powershellCommand = `
      $Excel = New-Object -ComObject Excel.Application
      $Excel.Visible = $false
      $Excel.DisplayAlerts = $false
      $Workbook = $Excel.Workbooks.Open('${filePath}')
      $Workbook.Save()
      $Workbook.Close()
      $Excel.Quit()

      `

      exec(
        powershellCommand,
        { shell: 'powershell.exe' },
        (error, stdout, stderr) => {
          if (error) {
            console.error(`Error al ejecutar el comando: ${error.message}`)
            reject(error)
          } else if (stderr) {
            console.error(`Error en la salida estándar: ${stderr}`)
            reject(new Error(stderr))
          } else {
            resolve(stdout)
          }
        },
      )
    })
  }

  async generateCertificateCodeToMethod(methodID: number) {
    try {
      const method = await this.GENERIC_METHODRepository.findOne({
        where: { id: methodID },
      })

      if (!method) {
        return handleInternalServerError('El método no existe')
      }

      if (method.certificate_code) {
        return handleOK('El método ya tiene un código de certificado')
      }

      const certificate = await this.certificateService.create('T', methodID)

      method.certificate_code = certificate.data.code
      method.certificate_id = certificate.data.id

      await this.GENERIC_METHODRepository.save(method)

      return handleOK(certificate)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

}
