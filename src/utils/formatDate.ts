export const formatDate = (date: string) => {
  const dateObj = new Date(date);

  // Format date as año/mes/día
  // 01/01/2021

  return `${dateObj.getFullYear()}/${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
}
