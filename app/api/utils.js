import { STORY_FIELDS } from "../isomorphic/constants";

export const getSearchPageItems = async (slug, offset, limit) => {
  const { results } = await (await fetch(`/api/v1/search?q=${slug}&offset=${offset}&limit=${limit + 1}`)).json();
  const loadMoreStories = results.stories.map((story) => {
    return { type: "story", story: story };
  });
  return loadMoreStories;
};

export const getStories = async (query, slug, offset, limit) => {
  const { stories } = await (
    await fetch(`/api/v1/stories?${query}=${slug}&offset=${offset}&limit=${limit + 1}`)
  ).json();
  const loadMoreStories = stories.map((story) => {
    return { type: "story", story: story };
  });
  return loadMoreStories;
};

export const getCollectionitems = async (slug, offset, limit) => {
  const { items } = await (
    await fetch(`/api/v1/collections/${slug}?&item-type=story&offset=${offset}&limit=${limit + 1}`)
  ).json();
  return items;
};

export const getAuthorStories = async (id, offset, limit) => {
  const { items } = await (
    await fetch(`/api/v1/authors/${id}/collection?&item-type=story&offset=${offset}&limit=${limit}`)
  ).json();
  return items;
};

export const loadRelatedStories = async (story, config) => {
  const { mountAt } = config || {};
  const mountAtPrefix = mountAt || "";
  const sectionQuery = story.sections && story.sections.length !== 0 ? `section-id=${story.sections[0].id}` : "";
  const response = await global
    .wretch(`${mountAtPrefix}/api/v1/stories/${story.id}/related-stories?${sectionQuery}`)
    .query({
      fields: STORY_FIELDS,
    })
    .get()
    .json((relatedStories) => relatedStories["related-stories"]);
  return response;
};
