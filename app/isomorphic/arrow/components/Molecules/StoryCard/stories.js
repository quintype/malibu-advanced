import { StoryCard } from "./index";

import { Headline } from "../../Atoms/Headline/index";
import { HeroImage } from "../../Atoms/HeroImage/index";
import { TimeStamp } from "../../Atoms/TimeStamp/index";
import { Author } from "../../Atoms/Author/index";
import { Subheadline } from "../../Atoms/Subheadline/index";
import { AuthorWithTime } from "../../Atoms/AuthorWithTimestamp";
import { StorycardContent } from "../StorycardContent/index";

import React from "react";
import { generateStory } from "../../Fixture";

import { optionalSelect, withStore } from "../../../../storybook";
import Readme from "./README.md";
import ReadmeForBorder from "./READMEBORDER.md";
import ReadmeForBgImage from "./READMEBGIMAGE.md";
import { color } from "@storybook/addon-knobs";
import "./storycard.m.css";

const story = generateStory();

const aspectRatioOptions = {
  "[16,9]": [16, 9],
  "[8,3]": [8, 3],
  "[1,1]": [1, 1],
  "[4, 3]": [4, 3],
  "[2, 3]": [2, 3]
};
const label = "color";
const defaultvalue = "#929292";
const sectionTagBorderColor = "Section Tag Border Color";
const defaultBorderColor = "#3a9fdd";
const config = {};
withStore(
  "Molecules/StoryCard",
  {
    qt: {
      config: {
        "cdn-image": "thumbor-stg.assettype.com",
        mountAt: "/sub-directory"
      }
    }
  },
  Readme
)
  .addDecorator((story) => <div style={{ maxWidth: "480px" }}>{story()}</div>)
  .add("Default Story Card", () => (
    <StoryCard story={story} borderColor={color(sectionTagBorderColor, defaultBorderColor)} config={config} />
  ))
  .add("Default with theme", () => (
    <StoryCard
      story={story}
      theme={color(label, defaultvalue)}
      centerAlign
      borderColor={color(sectionTagBorderColor, defaultBorderColor)}
      config={config}
    />
  ))
  .add("Default with mobile horizontal design", () => (
    <StoryCard
      story={story}
      isHorizontalMobile
      borderColor={color(sectionTagBorderColor, defaultBorderColor)}
      config={config}
    />
  ))
  .add("Horizontal Story Card", () => (
    <StoryCard
      story={story}
      isHorizontal
      borderColor={color(sectionTagBorderColor, defaultBorderColor)}
      config={config}
    />
  ))
  .add("Story Card w/ Image & Headline", () => (
    <StoryCard story={story}>
      <HeroImage story={story} />
      <Headline story={story} />
    </StoryCard>
  ))
  .add("Story Card w/ Image & Timestamp", () => (
    <StoryCard story={story}>
      <Headline story={story} />
      <TimeStamp story={story} />
    </StoryCard>
  ))
  .add("Story Card w/ Headline, Author & Subheadline", () => (
    <div style={{ height: 200 }}>
      <StoryCard story={story} isBottom>
        <Headline story={story} />
        <Subheadline story={story} />
        <Author story={story} isBottom />
      </StoryCard>
    </div>
  ))

  .add("Story Card w/ Image, Headline & Subheadline Author+Timestamp ", () => (
    <StoryCard story={story}>
      <HeroImage story={story} />
      <Headline story={story} />
      <Subheadline story={story} />
      <AuthorWithTime story={story} isBottom />
    </StoryCard>
  ))
  .add("Story Card w/o Image, Headline, Author+Timestamp & Subheadline", () => (
    <StoryCard story={story} isHorizontal>
      <HeroImage story={story} isHorizontal />
      <div>
        <Headline story={story} />
        <AuthorWithTime story={story} />
        <Subheadline story={story} />
      </div>
    </StoryCard>
  ))
  .add("Story Card using Story content", () => (
    <StoryCard story={story} borderColor={color(sectionTagBorderColor, defaultBorderColor)}>
      <HeroImage story={story} />
      <StorycardContent story={story} borderColor={color(sectionTagBorderColor, defaultBorderColor)} />
    </StoryCard>
  ))
  .add("Story card with aspect ratio", () => (
    <StoryCard
      story={story}
      aspectRatio={optionalSelect("Aspect Ratio", aspectRatioOptions)}
      borderColor={color(sectionTagBorderColor, defaultBorderColor)}
      config={config}
    />
  ))
  .add("Story card with story object as null", () => <StoryCard story={null} />)
  .add("Story card with an empty story object", () => <StoryCard story={{}} />);

withStore(
  "Molecules/StoryCard(with Border)",
  {
    qt: {
      config: {
        "cdn-image": "thumbor-stg.assettype.com"
      }
    }
  },
  ReadmeForBorder
)
  .addDecorator((story) => <div style={{ maxWidth: "650px" }}>{story()}</div>)
  .add("without border", () => (
    <StoryCard story={story} border="" borderColor={color(sectionTagBorderColor, defaultBorderColor)} config={config} />
  ))
  .add("Default Story Card with Full Border", () => (
    <StoryCard
      story={story}
      border="full"
      borderColor={color(sectionTagBorderColor, defaultBorderColor)}
      config={config}
    />
  ))
  .add("Default Story Card with Border Bottom", () => (
    <StoryCard
      story={story}
      border="bottom"
      borderColor={color(sectionTagBorderColor, defaultBorderColor)}
      config={config}
    />
  ))
  .add("Default Story Card with Box Shadow", () => (
    <StoryCard
      story={story}
      border="boxShadow"
      borderColor={color(sectionTagBorderColor, defaultBorderColor)}
      config={config}
    />
  ))
  .add("StoryCard using StoryCardContent ", () => (
    <StoryCard story={story} border="full" borderColor={color(sectionTagBorderColor, defaultBorderColor)}>
      <HeroImage story={story} />
      <StorycardContent story={story}>
        <Headline story={story} />
        <AuthorWithTime story={story} />
      </StorycardContent>
    </StoryCard>
  ))
  .add("StoryCard using StoryCardContent border Box and fullBleed False", () => (
    <StoryCard story={story} border="box" borderColor={color(sectionTagBorderColor, defaultBorderColor)}>
      <HeroImage story={story} FullBleed={false} />
      <StorycardContent story={story}>
        <Headline story={story} />
        <AuthorWithTime story={story} />
      </StorycardContent>
    </StoryCard>
  ))
  .add("Horizontal StoryCard using StoryCardContent border full ", () => (
    <StoryCard story={story} border="full" isHorizontal borderColor={color(sectionTagBorderColor, defaultBorderColor)}>
      <HeroImage story={story} isHorizontal />
      <StorycardContent story={story}>
        <Headline story={story} />
        <AuthorWithTime story={story} />
      </StorycardContent>
    </StoryCard>
  ));

withStore(
  "Molecules/StoryCard(with background image)",
  {
    qt: {
      config: {
        "cdn-image": "thumbor-stg.assettype.com"
      }
    }
  },
  ReadmeForBgImage
)
  .addDecorator((story) => <div style={{ maxWidth: "400px" }}>{story()}</div>)
  .add("Story Card with background image", () => (
    <StoryCard story={story} useImageAsBackground borderColor={color(sectionTagBorderColor, defaultBorderColor)}>
      <HeroImage story={story} />
      <StorycardContent story={story} />
    </StoryCard>
  ))
  .add("Story Card with background image and overlap with content", () => (
    <StoryCard story={story} bgImgContentOverlap borderColor={color(sectionTagBorderColor, defaultBorderColor)}>
      <HeroImage story={story} />
      <StorycardContent story={story} />
    </StoryCard>
  ));
