import { getMnc500PageData } from "@quintype/framework/server/api-client";

export async function loadMnc500PageData(client, rankingEntitySlug, config) {
  const [mnc500PageData] = await Promise.all([
    getMnc500PageData(client, rankingEntitySlug, config),
  ]);

  return {
    mnc500PageData,
    rankingEntitySlug,
  };
}
