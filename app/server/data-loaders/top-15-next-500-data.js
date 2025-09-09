import { getTop15Next500Data } from "@quintype/framework/server/api-client";

export async function loadTop15Next500Data(client, rankingEntitySlug, config) {
  const [top15Next500Data] = await Promise.all([
    getTop15Next500Data(client, rankingEntitySlug, config),
  ]);

  return {
    top15Next500Data,
    rankingEntitySlug,
  };
}
