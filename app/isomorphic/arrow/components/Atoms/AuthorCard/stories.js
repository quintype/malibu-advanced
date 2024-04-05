import React from "react";
import { generateStory } from "../../Fixture";
import { withStore, optionalSelect } from "../../../../storybook";
import { AuthorCard } from "./index";
import Readme from "./README.md";
import { boolean } from "@storybook/addon-knobs";

const authorTemplate = {
  "No value": "",
  default: "default",
  leftAligned: "leftAligned",
  centerAligned: "centerAligned",
};

const story = generateStory();

const singleAuthorStory = {
  ...story,
  authors: [
    {
      id: 123981,
      name: "Ravigopal Kesari",
      slug: "ravigopal-kesari",
      social: {
        twitter: {
          url: "https://www.twitter.com/sabqorg",
          handle: "elonmusk",
        },
      },
      "avatar-url":
        "https://lh5.googleusercontent.com/-NhNrHEp1w4M/AAAAAAAAAAI/AAAAAAAAAAs/lzYwVY1BQdQ/photo.jpg?sz=50",
      "avatar-s3-key": null,
      "twitter-handle": "quintype_inc",
      bio: "William Shakespeare was an English poet, playwright, and actor, widely regarded as the greatest writer in the English language and the world’s greatest dramatist. He is often called England’s national poet and the “Bard of Avon”",
      "contributor-role": {
        id: 873,
        name: "Author",
      },
    },
  ],
};

const multipleAuthorsStory = {
  ...story,
  authors: [
    ...story.authors,
    {
      id: 123981,
      name: "Ravigopal Kesari",
      slug: "ravigopal-kesari",
      social: {
        twitter: {
          url: "https://www.twitter.com/sabqorg",
          handle: "elonmusk",
        },
      },
      "avatar-url":
        "https://lh5.googleusercontent.com/-NhNrHEp1w4M/AAAAAAAAAAI/AAAAAAAAAAs/lzYwVY1BQdQ/photo.jpg?sz=50",
      "avatar-s3-key": null,
      "twitter-handle": "quintype_inc",
      bio: "William Shakespeare was an English poet, playwright, and actor, widely regarded as the greatest writer in the English language and the world’s greatest dramatist. He is often called England’s national poet and the “Bard of Avon”",
      "contributor-role": {
        id: 873,
        name: "Author",
      },
    },
    {
      id: 123982,
      name: "Gopal krishnan",
      slug: "ravigopal-kesari",
      social: {
        twitter: {
          url: "https://www.twitter.com/sabqorg",
          handle: "elonmusk",
        },
      },
      "avatar-url":
        "https://lh5.googleusercontent.com/-NhNrHEp1w4M/AAAAAAAAAAI/AAAAAAAAAAs/lzYwVY1BQdQ/photo.jpg?sz=50",
      "avatar-s3-key": null,
      "twitter-handle": "quintype_inc",
      bio: "William Shakespeare was an English poet, playwright, and actor, widely regarded as the greatest writer in the English language and the world’s greatest dramatist. He is often called England’s national poet and the “Bard of Avon”",
      "contributor-role": {
        id: 874,
        name: "Author",
      },
    },
    {
      id: 123985,
      name: "Virat Kohli",
      slug: "ravigopal-kesari",
      social: {
        twitter: {
          url: "https://www.twitter.com/sabqorg",
          handle: "elonmusk",
        },
      },
      "avatar-url":
        "https://lh5.googleusercontent.com/-NhNrHEp1w4M/AAAAAAAAAAI/AAAAAAAAAAs/lzYwVY1BQdQ/photo.jpg?sz=50",
      "avatar-s3-key": null,
      "twitter-handle": "quintype_inc",
      bio: "William Shakespeare was an English poet, playwright, and actor, widely regarded as the greatest writer in the English language and the world’s greatest dramatist. He is often called England’s national poet and the “Bard of Avon”",
      "contributor-role": {
        id: 879,
        name: "Author",
      },
    },
  ],
};

withStore(
  "Atoms/Author Card",
  {
    qt: {
      config: {
        "cdn-image": "thumbor-stg.assettype.com",
      },
    },
  },
  Readme
)
  .addDecorator((story) => <div style={{ maxWidth: "1000px", margin: "auto" }}>{story()}</div>)
  .add("Default", () => (
    <AuthorCard
      story={story}
      template={optionalSelect("Template Options", authorTemplate)}
      opts={{
        showBio: boolean("bio", false),
        showImage: boolean("image", true),
        showLabels: boolean("show labels", false),
        showGuestAuthorName: boolean("show guest author name", false),
        showGuestAuthorImage: boolean("show guest author image", false),
      }}
    />
  ))
  .add("single author template", () => (
    <AuthorCard
      story={singleAuthorStory}
      template={optionalSelect("Template Options", authorTemplate)}
      opts={{
        showBio: boolean("bio", true),
        showImage: boolean("image", true),
        showLabels: boolean("show labels", true),
        showGuestAuthorName: boolean("show guest author name", false),
        showGuestAuthorImage: boolean("show guest author image", false),
      }}
    />
  ))
  .add("Multiple author template", () => (
    <AuthorCard
      story={multipleAuthorsStory}
      template={optionalSelect("Template Options", authorTemplate)}
      opts={{
        showBio: boolean("bio", true),
        showImage: boolean("image", true),
        showLabels: boolean("show labels", true),
        showGuestAuthorName: boolean("show guest author name", false),
        showGuestAuthorImage: boolean("show guest author image", false),
      }}
    />
  ));
