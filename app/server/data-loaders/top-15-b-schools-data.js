import { getTop15BSchoolsData } from "@quintype/framework/server/api-client";

export async function loadTop15BSchoolsData(client, rankingEntitySlug, config) {
  const [top15BSchoolsData] = await Promise.all([
    getTop15BSchoolsData(client, rankingEntitySlug, config),
  ]);

  return {
    top15BSchoolsData,
    rankingEntitySlug,
  };
}
