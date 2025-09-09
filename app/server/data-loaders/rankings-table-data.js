import { getRankingsTableData } from "@quintype/framework/server/api-client";

export async function loadRankingsTableData(client, rankingEntitySlug, config) {
  const [rankingsTableData] = await Promise.all([
    getRankingsTableData(client, rankingEntitySlug, config),
  ]);

  return {
    rankingsTableData,
    rankingEntitySlug,
  };
}
