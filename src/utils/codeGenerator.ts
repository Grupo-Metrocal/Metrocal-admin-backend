interface ICodeGenerator {
  suffix?: string
  length: number
}

export const passwordResetCodeGenerator = ({
  suffix,
  length,
}: ICodeGenerator) => {
  const min = 1000
  const max = 9999

  const code = Math.floor(Math.random() * (max - min + 1)) + min
  const lenghtCode = code.toString().padStart(length, '0')

  return suffix ? `${suffix}_${lenghtCode}` : lenghtCode
}

export const generateQuoteRequestCode = (id: number) => {
  const year = new Date().getFullYear()
  return `NI-CS-${id.toString().padStart(4, '0')}-${year.toString().slice(-2)}`
}

export const generateQuoteServiceRequestCode = (id: number) => {
  const year = new Date().getFullYear()
  return `NI-SS-${id.toString().padStart(4, '0')}-${year.toString().slice(-2)}`
}

export const generateServiceCodeToMethod = (id: number) => {
  const year = new Date().getFullYear()
  return `NI-CS-${id.toString().padStart(4, '0')}-${year.toString().slice(-2)}`
}
