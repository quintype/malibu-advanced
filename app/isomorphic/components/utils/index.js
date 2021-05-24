import fetch from "node-fetch";

export const isValidEmail = email => {
  const re = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i;
  if (!re.test(email)) return false;
  if (email.length > 150 || email.length < 6) return false;
  return true;
};

export const getLoadMoreStories = async ({ offset, limit, isSearchPage = false, slug, query }) => {
  if (isSearchPage) {
    const { results } = await (await fetch(`/api/v1/search?q=${slug}&offset=${offset}&limit=${limit + 1}`)).json();
    const loadMoreStories = results.stories.map(story => {
      return { type: "story", story: story };
    });
    return loadMoreStories;
  }

  const { stories } = await (
    await fetch(`/api/v1/stories?${query}=${slug}&offset=${offset}&limit=${limit + 1}`)
  ).json();
  const loadMoreStories = stories.map(story => {
    return { type: "story", story: story };
  });
  return loadMoreStories;
};
