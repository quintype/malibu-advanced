/* eslint-disable no-undef: 0 */
import configJSON from "./config.json";
import { dummyStory, dummyPhotoStory, dummyLiveBlogStory, dummyListicleStory } from "./dummyStory";
import get from "lodash.get";
import { createStore } from "redux";

export const generateConfig = () => configJSON;

export const generateStory = (storyType, data = {}) => {
  switch (storyType) {
    case "photo-story":
      return Object.assign(dummyPhotoStory, data);
    case "live-blog":
      return Object.assign(dummyLiveBlogStory, data);
    case "listicle-story":
      return Object.assign(dummyListicleStory, data);
    default:
      return Object.assign(dummyStory, data);
  }
};

export const generateCollection = ({ stories = 0, subCollections = [], itemMeta = {} } = {}) => {
  const items = subCollections;
  Array(stories)
    .fill({ type: "story", ...itemMeta })
    .forEach((item, index) => {
      const story = generateStory();
      const itm = Object.assign({}, item, { id: story.id, story });
      items.push(itm);
    });
  return {
    type: "collection",
    name: "Politics",
    id: parseInt(Math.random() * 10 ** 10),
    slug: "collection-slug",
    template: "section",
    "created-at": 1597163351395,
    metadata: {
      "cover-image": {
        "cover-image-url":
          "https://thumbor-stg.assettype.com/ace/2020-08/f71dd527-cbc6-4cc9-94c2-8feee917f7e9/fortune.jpg",
        metadata: {
          width: 914,
          height: 1200,
          "mime-type": "image/jpeg",
          "file-size": 179037,
          "file-name": "fortune.jpg"
        },
        "cover-image-s3-key": "ace/2020-08/f71dd527-cbc6-4cc9-94c2-8feee917f7e9/fortune.jpg",
        caption: "Some Politician"
      },
      section: [{ id: 11181, name: "Health", "parent-id": null, "tree-ids": [11181] }]
    },
    summary:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer aliquam felis sed tellus mattis ultricies. Maecenas accumsan hendrerit turpis, a sollicitudin velit viverra nec. Praesent pretium, orci ac sodales volutpat, tellus orci rutrum metus.",
    items: items
  };
};

export const generateCollections = (count = 0) => {
  const collections = [];
  Array(count)
    .fill(0)
    .forEach(() => {
      collections.push(generateCollection({ stories: 10 }));
    });

  return {
    type: "collection",
    name: "News",
    id: parseInt(Math.random() * 10 ** 10),
    slug: "collection-slug",
    template: "section",
    metadata: {
      "cover-image": {
        "cover-image-url":
          "http://d9zv4zsfqrm9s.cloudfront.net/ace/2017-12/c811b029-962f-4364-b376-ec1548d67494/earth.jpg",
        "cover-image-metadata": {
          width: 600,
          height: 600,
          "mime-type": "image/jpeg",
          "focus-point": [355, 204]
        },
        "cover-image-s3-key": "vikatan/2019-01/f0b702ac-bfd1-4dd6-8e33-52cbb0bb3153/143203_thumb.jpg",
        caption: "Some Politician"
      },
      section: [{ id: 11181, name: "Health", "parent-id": null, "tree-ids": [11181] }]
    },
    summary: "This is a collection concerned with politics",
    items: collections
  };
};

export const generateCollectionsWithStories = (count = 0) => {
  const items = generateCollection({ stories: 12 });
  const collec = generateCollections(2);
  const collections = [];
  const merged = items.items.concat(collec.items);

  Array(count)
    .fill(0)
    .forEach(() => {
      collections.push(generateCollection({ stories: 12 }));
    });

  return {
    type: "collection",
    name: "News",
    id: parseInt(Math.random() * 10 ** 10),
    slug: "collection-slug",
    template: "section",
    metadata: {
      "cover-image": {
        "cover-image-url":
          "http://d9zv4zsfqrm9s.cloudfront.net/ace/2017-12/c811b029-962f-4364-b376-ec1548d67494/earth.jpg",
        "cover-image-metadata": {
          width: 600,
          height: 600,
          "mime-type": "image/jpeg",
          "focus-point": [355, 204]
        },
        "cover-image-s3-key": "vikatan/2019-01/f0b702ac-bfd1-4dd6-8e33-52cbb0bb3153/143203_thumb.jpg",
        caption: "Some Politician"
      },
      section: [{ id: 11181, name: "Health", "parent-id": null, "tree-ids": [11181] }]
    },
    summary: "This is a collection concerned with politics",
    items: merged
  };
};

export const generateSubMenu = () => {
  return {
    items: [
      {
        "tag-name": null,
        "item-id": 22564,
        rank: 5493,
        title: "Link 1",
        "item-type": "section",
        "section-slug": "gurupeyarchi",
        "tag-slug": null,
        id: 5493,
        "parent-id": null,
        url: "https://vikatan-web.qtstage.io/section/gurupeyarchi",
        "section-name": "அமெரிக்காவில்",
        data: {
          color: "#c7c7c7"
        },
        items: [
          {
            "tag-name": null,
            "item-id": 22384,
            rank: 5494,
            title: "Link 2",
            "item-type": "section",
            "section-slug": "cinema",
            "tag-slug": null,
            id: 5494,
            "parent-id": 5493,
            url: "https://vikatan-web.qtstage.io/section/cinema",
            "section-name": "அமெரிக்காவில்",
            data: {
              color: "#f7f7f7"
            }
          },
          {
            "tag-name": null,
            "item-id": 23089,
            rank: 5504,
            title: "Child 1",
            "item-type": "section",
            "section-slug": "dry6feb2019",
            "tag-slug": null,
            id: 5504,
            "parent-id": 5493,
            url: "https://vikatan-web.qtstage.io/section/dry6feb2019",
            "section-name": "அமெரிக்காவில்",
            data: {
              color: "#000000"
            }
          }
        ]
      }
    ]
  };
};
export const authorData = {
  slug: "parvathi-mohan-2",
  name: "Lucy Douglas",
  social: {
    twitter: {
      url: "https://twitter.com/Reena00659364",
      handle: "Twitter"
    },
    youtube: {
      url: "https://www.facebook.com/people/Reena-Singh/100005438855189",
      handle: "Youtube"
    },
    facebook: {
      url: "https://www.facebook.com/people/Reena-Singh/100005438855189",
      handle: "Facebook"
    },
    linkedin: {
      url: "https://www.facebook.com/people/Reena-Singh/100005438855189",
      handle: "LinkedIn"
    },
    whatsapp: {
      url: "https://www.facebook.com/people/Reena-Singh/100005438855189",
      handle: "Whatsapp"
    },
    instagram: {
      url: "https://www.facebook.com/people/Reena-Singh/100005438855189",
      handle: "Instagram"
    },
    pinterest: {
      url: "https://www.facebook.com/people/Reena-Singh/100005438855189",
      handle: "Pinterest"
    }
  },
  bio:
    "Lucy Douglas is a freelance journalist based in London. She has a particular interest in small business, startups and the founders behind them and, in a previous life, was an assistant-editor at Professional Beauty magazine, where she road-tested spas up and down the country and checked out the latest advances.",
  id: 94985,
  "avatar-url": "https://thumbor-stg.assettype.com/ace/2019-08/145ab200-429f-44ac-8618-00c6e4643e31/cat.jpeg",
  "avatar-s3-key": "ace/2019-08/145ab200-429f-44ac-8618-00c6e4643e31/cat.jpeg",
  "twitter-handle": "quintype_inc",
  stats: {
    contributions: null
  },
  metadata: {}
};

export const generateStoryElementData = (elementType) => {
  const story = generateStory();
  const storyElements = get(story, ["cards", "0", "story-elements"]);
  return storyElements.find((element) => {
    const { subtype, type } = element;
    if (subtype) return subtype === elementType;
    return type === elementType;
  });
};

export const generateMagazineIssues = () => {
  return [
    {
      collection: {
        id: 106138,
        name: "Manifique",
        metadata: {
          "cover-image": {
            success: true,
            url:
              "https://stg-quintype-dropbox.s3-accelerate.amazonaws.com/ace.staging.quintype.com/2020-09-09/874/aleksandra_tanasienko_oQi_UdQDkzw_unsplash.jpg",
            metadata: {
              width: 4000,
              height: 6000,
              "mime-type": "image/jpeg",
              "file-size": 2574353,
              "file-name": "aleksandra-tanasienko-oQi_UdQDkzw-unsplash.jpg"
            },
            "extracted-data": {
              artist: ""
            },
            attribution: "",
            "cover-image-url":
              "https://thumbor-stg.assettype.com/ace/2020-09/f20cecc2-2466-4e3d-8b04-f013d880a9d0/aleksandra_tanasienko_oQi_UdQDkzw_unsplash.jpg",
            "cover-image-s3-key":
              "ace/2020-09/f20cecc2-2466-4e3d-8b04-f013d880a9d0/aleksandra_tanasienko_oQi_UdQDkzw_unsplash.jpg"
          },
          entities: {
            collectionEntities: {
              magazine: [
                {
                  id: 199563,
                  name: "New Magazine",
                  type: "magazine",
                  "entity-type-id": 382
                }
              ]
            }
          }
        },
        "collection-date": null,
        slug: "manifique",
        template: "collection",
        "data-source": "manual",
        "created-at": 1599639879798
      }
    },
    {
      collection: {
        id: 106137,
        name: "High Times",
        metadata: {
          "cover-image": {
            success: true,
            url:
              "https://stg-quintype-dropbox.s3-accelerate.amazonaws.com/ace.staging.quintype.com/2020-09-28/294/da90b29ce035b5a3a134da39e94d654c.jpg",
            metadata: {
              width: 474,
              height: 581,
              "mime-type": "image/jpeg",
              "file-size": 49921,
              "file-name": "da90b29ce035b5a3a134da39e94d654c.jpg"
            },
            "extracted-data": {
              artist: ""
            },
            attribution: "",
            "cover-image-url":
              "https://thumbor-stg.assettype.com/ace/2020-09/92f5453c-4477-40d3-9a44-3cf0c245b268/da90b29ce035b5a3a134da39e94d654c.jpg",
            "cover-image-s3-key":
              "ace/2020-09/92f5453c-4477-40d3-9a44-3cf0c245b268/da90b29ce035b5a3a134da39e94d654c.jpg"
          },
          entities: {
            collectionEntities: {
              magazine: [
                {
                  id: 199563,
                  name: "New Magazine",
                  type: "magazine",
                  "entity-type-id": 382
                }
              ]
            }
          }
        },
        "collection-date": null,
        slug: "high-times",
        template: "collection",
        "data-source": "manual",
        "created-at": 1599639711992
      }
    },
    {
      collection: {
        id: 106131,
        name: "New Magazine Issue",
        metadata: {
          "cover-image": {
            success: true,
            url:
              "https://stg-quintype-dropbox.s3-accelerate.amazonaws.com/ace.staging.quintype.com/2020-09-09/1200/alexis_zacharko_07rXq3YroVM_unsplash.jpg",
            metadata: {
              width: 3456,
              height: 5184,
              "mime-type": "image/jpeg",
              "file-size": 3084612,
              "file-name": "alexis-zacharko-07rXq3YroVM-unsplash.jpg",
              "focus-point": [2154, 2269]
            },
            "extracted-data": {
              artist: ""
            },
            attribution: "",
            "cover-image-url":
              "https://thumbor-stg.assettype.com/ace/2020-09/ed79b1ed-5d63-4ec1-8a4b-da87d8ed7edc/alexis_zacharko_07rXq3YroVM_unsplash.jpg",
            "cover-image-s3-key":
              "ace/2020-09/ed79b1ed-5d63-4ec1-8a4b-da87d8ed7edc/alexis_zacharko_07rXq3YroVM_unsplash.jpg"
          },
          entities: {
            collectionEntities: {
              magazine: [
                {
                  id: 199563,
                  name: "New Magazine",
                  type: "magazine",
                  "entity-type-id": 382
                }
              ]
            }
          }
        },
        "collection-date": null,
        slug: "new-magazine-issue",
        template: "collection",
        "data-source": "manual",
        "created-at": 1599616208142
      }
    },
    {
      collection: {
        id: 106089,
        name: "First Magazine Collection",
        metadata: {
          "cover-image": {
            "cover-image-s3-key": "ace/2020-07/3e3dc7df-8a1c-462d-a236-265d45c28651/evil_caat.jpg",
            "cover-image-metadata": {
              "mime-type": "image/jpeg",
              "focus-point": [3444, 3222],
              width: 6000,
              "file-size": 10319729,
              "file-name": "evil caat.jpg",
              height: 4000
            },
            caption: null,
            "cover-image-url":
              "https://thumbor-stg.assettype.com/ace/2020-07/3e3dc7df-8a1c-462d-a236-265d45c28651/evil_caat.jpg"
          },
          entities: {
            collectionEntities: {
              magazine: [
                {
                  id: 199563,
                  name: "New Magazine",
                  type: "magazine",
                  "entity-type-id": 382
                }
              ]
            }
          }
        },
        "collection-date": null,
        slug: "first-magazine-collection",
        template: "collection",
        "data-source": "automated",
        "created-at": 1599571645414
      }
    }
  ];
};

const reducer = () => ({ qt: { config: { "cdn-image": "thumbor-stg.assettype.com" } } });
export const generateStore = createStore(reducer);
