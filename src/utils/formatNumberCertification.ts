export const formatNumberCertification = (
  number: string | number,
  fraction = 1,
) => {
  const convertNumber = typeof number === 'string' ? Number(number) : number

  if (isNaN(convertNumber)) {
    return number
  }

  if (fraction === 0) {
    return number
  }

  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: fraction,
    maximumFractionDigits: fraction,
  }).format(convertNumber)
}

export const formatSameNumberCertification = (number = 0) => {
  const fractions = number.toString().split('.')
  return formatNumberCertification(
    number,
    fractions[1] ? fractions[1].length : 0,
  )
}

export const convertToValidNumber = (value: string) => {
  let cleanedStr = value.replace(/,/g, '')
  const number = parseFloat(cleanedStr)

  if (isNaN(number)) {
    return value
  }

  return number
}
