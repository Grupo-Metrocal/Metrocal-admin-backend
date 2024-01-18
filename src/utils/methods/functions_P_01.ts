import { type EnvironmentalConditionsNI_MCIT_P_01 } from 'src/modules/methods/entities/NI_MCIT_P_01/steps/environmental_conditions.entity'
export const getAverage = (array: number[]) => {
  const sum = array.reduce((a, b) => a + b, 0)
  return sum / array.length
}

export const calculateEnvironmentConditions = (
  environmental_conditions: EnvironmentalConditionsNI_MCIT_P_01,
) => {
  const temperatureI = environmental_conditions.cycles.map(
    (cycle) => cycle.ta.tac.initial,
  )

  const temperatureF = environmental_conditions.cycles.map(
    (cycle) => cycle.ta.tac.end,
  )

  const humidityI = environmental_conditions.cycles.map(
    (cycle) => cycle.ta.hrp.initial,
  )

  const humidityF = environmental_conditions.cycles.map(
    (cycle) => cycle.ta.hrp.end,
  )

  const pressureI = environmental_conditions.cycles.map(
    (cycle) => cycle.hPa.pa.initial,
  )

  const pressureF = environmental_conditions.cycles.map(
    (cycle) => cycle.hPa.pa.end,
  )

  const temperatureAverageI = getAverage(temperatureI)
  const temperatureAverageF = getAverage(temperatureF)
  const humidityAverageI = getAverage(humidityI)
  const humidityAverageF = getAverage(humidityF)
  const pressureAverageI = getAverage(pressureI)
  const pressureAverageF = getAverage(pressureF)

  const temperatureAverage = (temperatureAverageI + temperatureAverageF) / 2
  const humidityAverage = (humidityAverageI + humidityAverageF) / 2
  const pressureAverage = (pressureAverageI + pressureAverageF) / 2

  return {
    temperatureAverage,
    humidityAverage,
    pressureAverage,
  }
}
