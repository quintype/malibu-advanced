import { getTop100BillionairesData } from "@quintype/framework/server/api-client";

export async function loadTop100BillionairesData(client, rankingEntitySlug, config) {
  const [top100BillionairesData] = await Promise.all([
    getTop100BillionairesData(client, rankingEntitySlug, config),
  ]);

  return {
    top100BillionairesData,
    rankingEntitySlug,
  };
}
