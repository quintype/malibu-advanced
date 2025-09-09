import { getBestBSchoolsPageData } from "@quintype/framework/server/api-client";

export async function loadBestBSchoolsPageData(client, rankingEntitySlug, config) {
  const [bestBSchoolsPageData] = await Promise.all([
    getBestBSchoolsPageData(client, rankingEntitySlug, config),
  ]);

  return {
    bestBSchoolsPageData,
    rankingEntitySlug,
  };
}
