import { getCollectionitems, getSearchPageItems, getStories } from "../../../api/utils";

export const isValidEmail = email => {
  const re = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i;
  if (!re.test(email)) return false;
  if (email.length > 150 || email.length < 6) return false;
  return true;
};

export const getLoadMoreStories = async ({
  offset,
  limit,
  isSearchPage = false,
  slug,
  query,
  shouldUseCollection,
  setStories,
  storiesToRender,
  setStoriesToRender,
  stories
}) => {
  if (isSearchPage) {
    const loadMoreStories = await getSearchPageItems(slug, offset, limit);
    setStories(stories.slice(0, storiesToRender).concat(loadMoreStories));
    setStoriesToRender(storiesToRender + offset);
  }

  if (shouldUseCollection) {
    const loadMoreStories = await getCollectionitems(slug, offset, limit);
    setStories(stories.slice(0, storiesToRender).concat(loadMoreStories));
    setStoriesToRender(storiesToRender + offset);
  }

  const loadMoreStories = await getStories(query, slug, offset, limit);
  setStories(stories.slice(0, storiesToRender).concat(loadMoreStories));
  setStoriesToRender(storiesToRender + offset);
};
