import { getRankingsPageData } from "@quintype/framework/server/api-client";

export async function loadRankingsPageData(client, rankingEntitySlug, config) {
  const [rankingsPageData] = await Promise.all([
    getRankingsPageData(client, rankingEntitySlug, config),
  ]);

  return {
    rankingsPageData,
    rankingEntitySlug,
  };
}
