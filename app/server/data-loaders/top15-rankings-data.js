import { getTop15RankingsData } from "@quintype/framework/server/api-client";

export async function loadTop15RankingsData(client, rankingEntitySlug, config) {
  const [top15RankingsData] = await Promise.all([
    getTop15RankingsData(client, rankingEntitySlug, config),
  ]);

  return {
    top15RankingsData,
    rankingEntitySlug,
  };
}
