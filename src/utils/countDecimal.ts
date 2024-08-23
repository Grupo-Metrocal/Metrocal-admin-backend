export const countDecimals = (number) => {
  const convertNumber = typeof number === 'string' ? Number(number) : number

  if (isNaN(convertNumber)) {
    return number
  }

  if (!convertNumber) {
    return 0
  }

  if (Math.floor(convertNumber) === convertNumber) {
    return 0
  }

  return convertNumber.toString().split('.')[1].length || 0
}
