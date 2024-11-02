export const formatDate = (date: string) => {
  let dateObj
  if (date) {
    dateObj = new Date(date)
  } else {
    dateObj = new Date()
  }

  const month =
    dateObj.getUTCMonth() + 1 < 10
      ? `0${dateObj.getUTCMonth() + 1}`
      : dateObj.getUTCMonth() + 1

  const day =
    dateObj.getUTCDate() < 10
      ? `0${dateObj.getUTCDate()}`
      : dateObj.getUTCDate()

  return `${dateObj.getUTCFullYear()}-${month}-${day}`
}
