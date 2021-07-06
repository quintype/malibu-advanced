import { getCollectionitems, getSearchPageItems, getStories, getAuthorStories } from "../../../api/utils";

export const isValidEmail = email => {
  const re = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i;
  if (!re.test(email)) return false;
  if (email.length > 150 || email.length < 6) return false;
  return true;
};

export const getQueryParam = (url, query) => {
  const urlObj = new URL(url);
  const urlSubstring = urlObj.search;
  return new URLSearchParams(urlSubstring).get(query);
};

export const generateRedirect = async (integrationId, redirectUrl) => {
  const params = `client_id=${integrationId}&redirect_uri=${redirectUrl}&response_type=code&allow_ajax=true`;
  const url = `/api/auth/v1/oauth/authorize?${params}`;
  const res = await window.fetch(url, {
    method: "GET"
  });
  if (res) {
    if (res.status === 200) {
      const response = await res.json();
      return response.redirect_uri;
    } else {
      const response = await res.json();
      window.alert(response.error_description);
    }
  }
};

export const getCookie = name => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2)
    return parts
      .pop()
      .split(";")
      .shift();
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
  stories,
  isSectionPage,
  authorId
}) => {
  if (isSearchPage) {
    const loadMoreStories = await getSearchPageItems(slug, offset, limit);
    setStories(stories.slice(0, storiesToRender).concat(loadMoreStories));
    setStoriesToRender(storiesToRender + limit);
    return null;
  }

  if (shouldUseCollection && isSectionPage) {
    const loadMoreStories = await getCollectionitems(slug, offset, limit);
    setStories(stories.slice(0, storiesToRender).concat(loadMoreStories));
    setStoriesToRender(storiesToRender + limit);
    return null;
  }

  if (authorId) {
    const loadMoreStories = await getAuthorStories(authorId, offset, limit);
    setStories(stories.slice(0, storiesToRender).concat(loadMoreStories));
    setStoriesToRender(storiesToRender + limit);
    return null;
  }

  const loadMoreStories = await getStories(query, slug, offset, limit);
  setStories(stories.slice(0, storiesToRender).concat(loadMoreStories));
  setStoriesToRender(storiesToRender + limit);
  return null;
};
