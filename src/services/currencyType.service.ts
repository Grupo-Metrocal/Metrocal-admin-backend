import axios from 'axios'
import * as xml2js from 'xml2js'

// URL del servicio SOAP
const url = 'https://servicios.bcn.gob.ni/Tc_Servicio/ServicioTC.asmx'

// Función para recuperar el tipo de cambio del día
export const getExchangeRateForDay = async (
  year: number,
  month: number,
  day: number,
): Promise<number | null> => {
  const soapBody = `
        <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
            <soap:Body>
                <RecuperaTC_Dia xmlns="http://servicios.bcn.gob.ni/">
                    <Ano>${year}</Ano>
                    <Mes>${month}</Mes>
                    <Dia>${day}</Dia>
                </RecuperaTC_Dia>
            </soap:Body>
        </soap:Envelope>
    `

  try {
    const response = await axios.post(url, soapBody, {
      headers: {
        'Content-Type': 'text/xml;charset=UTF-8',
        SOAPAction: 'http://servicios.bcn.gob.ni/RecuperaTC_Dia',
      },
      httpsAgent: new (require('https').Agent)({
        rejectUnauthorized: false,
      }),
    })

    // Parsear la respuesta XML
    const parser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true })
    const result = await new Promise((resolve, reject) => {
      parser.parseString(response.data, (err: any, result: any) => {
        if (err) {
          reject(err)
        } else {
          resolve(result)
        }
      })
    })

    // Extraer el tipo de cambio de la respuesta
    const exchangeRate =
      result['soap:Envelope']['soap:Body']['RecuperaTC_DiaResponse'][
        'RecuperaTC_DiaResult'
      ]
    return parseFloat(exchangeRate) // Retorna el tipo de cambio como un número
  } catch (error) {
    console.error('Error:', error)
    return null // Retorna null en caso de error
  }
}

// Llamar a la función con la fecha deseada y manejar el resultado
/*
const today = new Date()
getExchangeRateForDay(
  today.getFullYear(),
  today.getMonth() + 1,
  today.getDate(),
)
  .then((exchangeRate) => {
    if (exchangeRate !== null) {
      console.log(
        `Tipo de cambio del ${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}: ${exchangeRate}`,
      )
    } else {
      console.log('No se pudo obtener el tipo de cambio.')
    }
  })
  .catch((error) => {
    console.error('Error al obtener el tipo de cambio:', error)
  })
*/
