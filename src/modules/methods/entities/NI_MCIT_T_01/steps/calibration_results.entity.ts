import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm'
import { NI_MCIT_T_01 } from '../NI_MCIT_T_01.entity'

@Entity('calibration_results_NI_MCIT_T_01')
export class CalibrationResultsNI_MCIT_T_01 {
  @PrimaryGeneratedColumn('increment')
  id: number

  @OneToMany(
    () => NI_MCIT_T_01,
    (NI_MCIT_T_01) => NI_MCIT_T_01.calibration_results,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  NI_MCIT_T_01: NI_MCIT_T_01[]

  @Column('jsonb', { nullable: true })
  results?: IResults_NI_MCIT_T_01[]
}

export interface IResults_NI_MCIT_T_01 {
  indication_linear: {
    patron: number
    thermometer: number
  }[]
}

// example
/*
"results": [
        {
          "indication_linear": [
            {
              "patron": 0,
              "thermometer": 0
            },
            {
              "patron": 0,
              "thermometer": 
            },
            {
              "patron": 0,
              "thermometer": 0
            }, 
          ]
        },
        {
          "indication_linear": [
            {
              "patron": 10,
              "thermometer": 10
            },
            {
              "patron": 10,
              "thermometer": 10
            },
            {
              "patron": 10,
              "thermometer": 10
            },
          ]
        },
        {
          "indication_linear": [
            {
              "patron": 20,
              "thermometer": 20
            },
            {
              "patron": 20,
              "thermometer": 20
            },
            {
              "patron": 20,
              "thermometer": 20
            },
          ]
        },
        {
          "indication_linear": [
            {
              "patron": 30,
              "thermometer": 30
            },
            {
              "patron": 30,
              "thermometer": 30
            },
            {
              "patron": 30,
              "thermometer": 30
            },
          ]
        },
        {
          "indication_linear": [
            {
              "patron": 40,
              "thermometer": 40
            },
            {
              "patron": 40,
              "thermometer": 40
            },
            {
              "patron": 40,
              "thermometer": 40
            },
          ]
        },
        {
          "indication_linear": [
            {
              "patron": 50,
              "thermometer": 50
            },
            {
              "patron": 50,
              "thermometer": 50
            },
            {
              "patron": 50,
              "thermometer": 50
            },
          ]
        },
        {
          "indication_linear": [
            {
              "patron": 60,
              "thermometer": 60
            },
            {
              "patron": 60,
              "thermometer": 60
            },
            {
              "patron": 60,
              "thermometer": 60
            },
          ]
        },
        {
          "indication_linear": [
            {
              "patron": 70,
              "thermometer": 70
            },
            {
              "patron": 70,
              "thermometer": 70
            },
            {
              "patron": 70,
              "thermometer": 70
            },
          ]
        },
        {
          "indication_linear": [
            {
              "patron": 80,
              "thermometer": 80
            },
            {
              "patron": 80,
              "thermometer": 80
            },
            {
              "patron": 80,
              "thermometer": 80
            },
          ]
        },
        {
          "indication_linear": [
            {
              "patron": 90,
              "thermometer": 90
            },
            {
              "patron": 90,
              "thermometer": 90
            },
            {
              "patron": 90,
              "thermometer": 90
            },
          ]
        }
      ]
*/
