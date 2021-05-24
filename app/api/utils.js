export const getSearchPageItems = async (slug, offset, limit) => {
  const { results } = await (await fetch(`/api/v1/search?q=${slug}&offset=${offset}&limit=${limit + 1}`)).json();
  const loadMoreStories = results.stories.map(story => {
    return { type: "story", story: story };
  });
  return loadMoreStories;
};

export const getStories = async (query, slug, offset, limit) => {
  const { stories } = await (
    await fetch(`/api/v1/stories?${query}=${slug}&offset=${offset}&limit=${limit + 1}`)
  ).json();
  const loadMoreStories = stories.map(story => {
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
