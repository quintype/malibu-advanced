import get from "lodash/get";
export function loadCustomSeoMetadata(data) {
  const metaDescription = "";
  const metaTitle = "";

  return {
    title: metaTitle,
    description: metaDescription,
    ogTitle: metaTitle,
    ogDescription: metaDescription,
    twitterTitle: metaTitle,
    twitterDescription: metaDescription,
    ogImage: get(data, ["story", "alternative", "home", "default", "hero-image", "hero-image-s3-key"], ""),
    twitterImage: get(data, ["story", "alternative", "home", "default", "hero-image", "hero-image-s3-key"], "")
  };
}
