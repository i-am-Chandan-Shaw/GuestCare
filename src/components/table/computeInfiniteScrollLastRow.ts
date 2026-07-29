export function computeInfiniteScrollLastRow(params: {
  startRow: number;
  rows: unknown[];
  pageSize: number;
  totalCountFromApi: number;
}): number {
  const { startRow, rows, pageSize, totalCountFromApi } = params;
  const receivedCount = rows.length;
  const endIndex = startRow + receivedCount;

  if (receivedCount === 0) {
    return startRow;
  }

  if (receivedCount < pageSize || endIndex >= totalCountFromApi) {
    return totalCountFromApi;
  }

  return -1;
}
