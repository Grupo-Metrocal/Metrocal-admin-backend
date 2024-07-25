export const formatDate = (date: string) => {
  const dateObj = new Date(date)
  const month =
    dateObj.getMonth() + 1 < 10
      ? `0${dateObj.getMonth() + 1}`
      : dateObj.getMonth() + 1

  return `${dateObj.getFullYear()}-${month}-${dateObj.getDate()}`
}
