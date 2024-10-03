export const formatDate = (date: string) => {
  let dateObj
  if (date) {
    dateObj = new Date(date)
  } else {
    dateObj = new Date()
  }

  const month =
    dateObj.getMonth() + 1 < 10
      ? `0${dateObj.getMonth() + 1}`
      : dateObj.getMonth() + 1

  return `${dateObj.getFullYear()}-${month}-${dateObj.getDate()}`
}
