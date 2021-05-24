export const getMoreAuthorStories = async ({ author, offset, limit }) => {
  if (!global.wretch) return;
  return global
    .wretch(`/api/v1/authors/${author.id}/collection`)
    .query({
      "item-type": "story",
      offset,
      limit
    })
    .get()
    .json();
};

export const filterCollectionStories = storyList => {
  return storyList.filter(item => item.type === "story");
};
