export const executeTransaction = async (manager: any, method: any, T: any) => {
  await manager.save(T);
  await manager.save(method);
};