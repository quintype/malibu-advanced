import React from "react";
import TextStoryTemplate from "../../../arrow/components/Rows/StoryTemplates/TextStoryTemplates";
import { object } from "prop-types";

const TextStory = ({ story, config, relatedStories }) => {
  // console.log("INSIDE_TEXT_STORY --->", relatedStories);
  const templateConfig = {
    asideCollection: {
      data: {
        "related-stories": [
          {
            "author-name": "Athira M.R",
            headline: "New story",
            slug: "entertainment/bollywood/new-story",
            "last-published-at": 1630295791336,
            alternative: {},
            "hero-image-metadata": {
              "mime-type": "image/jpeg",
              width: 4288,
              "file-size": 1641868,
              "file-name": "aneta-pawlik-GelF0x5e--c-unsplash.jpg",
              height: 2848,
            },
            id: "fca623cd-2480-4d0e-bba1-5f3246026ae8",
            "hero-image-s3-key":
              "malibu/2021-08/45e276ec-6885-47b2-b252-57581dd77957/aneta_pawlik_GelF0x5e__c_unsplash.jpg",
            url: "https://malibu-web.quintype.io/entertainment/bollywood/new-story",
            "author-id": 1543270,
            "first-published-at": 1630295746762,
            "hero-image-caption": "new",
            "story-template": "text",
            authors: [
              {
                slug: "athira-m-r",
                social: {},
                name: "Athira M.R",
                "contributor-role": {
                  id: 3336,
                  name: "Author",
                },
                "avatar-url":
                  "https://lh6.googleusercontent.com/-vDssrJx_ej0/AAAAAAAAAAI/AAAAAAAAAAA/AMZuuckeiS9EPxfzZfOL3wYyiHhOKp-6rA/s96-c/photo.jpg",
                bio: null,
                id: 1543270,
                "avatar-s3-key": null,
                "twitter-handle": null,
              },
            ],
            metadata: {
              "card-share": {
                shareable: false,
              },
            },
          },
          {
            "author-name": "Amogh Sahasrabhojanee",
            headline: 'When Congress, BJP "Dudes" Gave Each Other Free Speech Lessons ',
            slug: "politics/regional/when-congress-bjp-dudes-gave-each-other-free-speech-lessons",
            "last-published-at": 1630064165192,
            alternative: {},
            "hero-image-metadata": {
              width: 300,
              height: 199,
              "mime-type": "image/webp",
              "file-size": 16782,
              "file-name":
                "malibu_2021-08_45e276ec-6885-47b2-b252-57581dd77957_aneta_pawlik_GelF0x5e__c_unsplash (1).webp",
            },
            id: "6608b275-16fe-448f-9f68-6f3936ee1368",
            "hero-image-s3-key":
              "malibu/2021-08/4b76052d-42bd-4bcc-9d7f-79282708ee77/malibu_2021_08_45e276ec_6885_47b2_b252_57581dd77957_aneta_pawlik_GelF0x5e__c_unsplash__1_.webp",
            url: "https://malibu-web.quintype.io/politics/regional/when-congress-bjp-dudes-gave-each-other-free-speech-lessons",
            "author-id": 1539314,
            "first-published-at": 1620640069046,
            "hero-image-caption": null,
            "story-template": "text",
            authors: [
              {
                slug: "amogh-sahasrabhojanee",
                social: {},
                name: "Amogh Sahasrabhojanee",
                "contributor-role": {
                  id: 3336,
                  name: "Author",
                },
                "avatar-url":
                  "https://gumlet.assettype.com/malibu/2021-05/282545bc-229f-4e83-bf21-bffd6438bbf5/xps_YNliXm_hMn8_unsplash.jpg",
                bio: null,
                id: 1539314,
                "avatar-s3-key": "malibu/2021-05/282545bc-229f-4e83-bf21-bffd6438bbf5/xps_YNliXm_hMn8_unsplash.jpg",
                "twitter-handle": null,
              },
            ],
            metadata: {
              "card-share": {
                shareable: false,
              },
            },
          },
          {
            "author-name": "Amogh Sahasrabhojanee",
            headline: 'West Bengal Moves On From Election Bile To "VIP Security" Politics',
            slug: "politics/regional/west-bengal-moves-on-from-election-bile-to-vip-security-politics",
            "last-published-at": 1628135647736,
            alternative: {},
            "hero-image-metadata": {
              width: 650,
              height: 400,
              "mime-type": "image/webp",
              "file-size": 54644,
              "file-name": "bengal-security_650x400_61461179721.webp",
            },
            id: "2f656a25-62df-4e97-b55c-c9121b9963a8",
            "hero-image-s3-key":
              "malibu/2021-05/735ebefe-650d-4a05-891d-8c0a665aea3c/bengal_security_650x400_61461179721.webp",
            url: "https://malibu-web.quintype.io/politics/regional/west-bengal-moves-on-from-election-bile-to-vip-security-politics",
            "author-id": 1539314,
            "first-published-at": 1620820548217,
            "hero-image-caption": null,
            "story-template": "text",
            authors: [
              {
                slug: "amogh-sahasrabhojanee",
                social: {},
                name: "Amogh Sahasrabhojanee",
                "contributor-role": {
                  id: 3336,
                  name: "Author",
                },
                "avatar-url":
                  "https://gumlet.assettype.com/malibu/2021-05/282545bc-229f-4e83-bf21-bffd6438bbf5/xps_YNliXm_hMn8_unsplash.jpg",
                bio: null,
                id: 1539314,
                "avatar-s3-key": "malibu/2021-05/282545bc-229f-4e83-bf21-bffd6438bbf5/xps_YNliXm_hMn8_unsplash.jpg",
                "twitter-handle": null,
              },
            ],
            metadata: {
              "card-share": {
                shareable: false,
              },
            },
          },
          {
            "author-name": "Amogh Sahasrabhojanee",
            headline: "Birthday Greetings, KA Council Support: BJP-JDS Camaraderie Grows",
            slug: "politics/regional/birthday-greetings-ka-council-support-bjp-jds-camaraderie-grows",
            "last-published-at": 1620640125633,
            alternative: {},
            "hero-image-metadata": {
              width: 650,
              height: 400,
              "mime-type": "image/webp",
              "file-size": 41144,
              "file-name": "42hcl53_pm-modi-kumaraswamy-twitter-650_625x300_13_August_18.webp",
            },
            id: "5c296687-39d6-4cff-b32a-f792ae09d2f0",
            "hero-image-s3-key":
              "malibu/2021-05/bb05700b-4bc9-4903-9777-1e796583104e/42hcl53_pm_modi_kumaraswamy_twitter_650_625x300_13_August_18.webp",
            url: "https://malibu-web.quintype.io/politics/regional/birthday-greetings-ka-council-support-bjp-jds-camaraderie-grows",
            "author-id": 1539314,
            "first-published-at": 1620640125633,
            "hero-image-caption": null,
            "story-template": "text",
            authors: [
              {
                slug: "amogh-sahasrabhojanee",
                social: {},
                name: "Amogh Sahasrabhojanee",
                "contributor-role": {
                  id: 3336,
                  name: "Author",
                },
                "avatar-url":
                  "https://gumlet.assettype.com/malibu/2021-05/282545bc-229f-4e83-bf21-bffd6438bbf5/xps_YNliXm_hMn8_unsplash.jpg",
                bio: null,
                id: 1539314,
                "avatar-s3-key": "malibu/2021-05/282545bc-229f-4e83-bf21-bffd6438bbf5/xps_YNliXm_hMn8_unsplash.jpg",
                "twitter-handle": null,
              },
            ],
            metadata: {
              "card-share": {
                shareable: false,
              },
            },
          },
        ],
      },
      config: {
        collectionNameBorderColor: "#3a9fdd",
        title: "Aside Collection Title",
        theme: "#33dd22",
        showAuthor: true,
        showTime: true,
      },
    },
  };
  return <TextStoryTemplate story={story} config={{ ...config, ...templateConfig }} />;
};

TextStory.propTypes = {
  story: object,
  config: object,
  relatedStories: object,
};

export default React.memo(TextStory);
