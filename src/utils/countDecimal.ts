export const countDecimals = (number) => {
  if (Math.floor(number) === number) {
    return 0
  }
  return number.toString().split('.')[1].length || 0
}
