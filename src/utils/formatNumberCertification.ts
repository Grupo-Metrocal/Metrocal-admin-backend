export const formatNumberCertification = (
  number: string | number,
  fraction = 1,
) => {
  const convertNumber = typeof number === 'string' ? Number(number) : number

  if (isNaN(convertNumber)) {
    return number
  }

  const value = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: fraction,
    maximumFractionDigits: fraction,
  }).format(convertNumber)

  return value === '-0' ? 0 : value
}

export const formatSameNumberCertification = (number = 0) => {
  if (!number) {
    return number
  }

  const fractions = number.toString().split('.')
  return formatNumberCertification(
    number,
    fractions[1] ? fractions[1].length : 0,
  )
}

export const convertToValidNumber = (value: any) => {
  if (typeof value === 'number') {
    return value
  }

  let cleanedStr

  try {
    cleanedStr = value.replace(/\s/g, '').replace(/,/g, '.')
  } catch (e) {}

  const number = parseFloat(cleanedStr)

  if (isNaN(number)) {
    return value
  }

  return number
}

export const repairNumberFromCertificate = (value: any) => {
  if (typeof value === 'number') {
    return value
  }

  let cleanedStr = value.replace(/\s/g, '').replace(/,/g, '')

  const number = parseFloat(cleanedStr)

  if (isNaN(number)) {
    return value
  }

  return number
}
