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

export function loadRelatedStories(story, config) {
  const { mountAt } = config || {};
  const mountAtPrefix = mountAt || "";
  const FIELDS =
    "id,metadata,story-template,headline,slug,hero-image-s3-key,hero-image-metadata,author-name,author-id,authors,url,alternative,last-published-at,first-published-at,hero-image-caption";
  const sectionQuery = story.sections && story.sections.length !== 0 ? `section-id=${story.sections[0].id}` : "";
  return fetch(`${mountAtPrefix}/api/v1/stories/${story.id}/related-stories?${sectionQuery}&fields=${FIELDS}`)
    .then((relatedStories) => relatedStories.json())
    .then((relatedStories) => relatedStories["related-stories"])
    .catch((err) => {
      console.error("Error in retrieving related stories :", err);
      return [];
    });
}
