import React from "react";
import PropTypes from "prop-types";
import kebabCase from "lodash.kebabcase";
import { ResponsiveImage, Link } from "@quintype/components";
import { Twitter } from "../../Svgs/SocialIcons/twitter";
import "./author-card.m.css";
import { useStateValue } from "../../SharedContext";
import { getTextColor, getAuthorTwitterUrl } from "../../../utils/utils";

const authorImage = (author) => {
  const { "avatar-url": avatarUrl, "avatar-s3-key": avatarS3Key, name: authorName } = author;
  if (!avatarUrl && !avatarS3Key) {
    return null;
  }
  return (
    <figure data-test-id="author-image" className="arr--author-image">
      {avatarS3Key ? (
        <ResponsiveImage
          slug={avatarS3Key}
          aspectRatio={[1, 1]}
          defaultWidth={48}
          imgParams={{ auto: ["format", "compress"] }}
          alt={authorName}
        />
      ) : (
        <img src={avatarUrl} alt={authorName} />
      )}
    </figure>
  );
};

const AuthorsImage = ({ authors, mountAt = "" }) => {
  const isSingleAuthor = authors.length === 1;

  const authorsWithImages = authors.filter((author) => author["avatar-url"] || author["avatar-s3-key"]);
  return (
    <div data-test-id="author-image" styleName="author-image-wrapper" className="arr-author-image">
      {authorsWithImages.map((author, index) => {
        return (
          <React.Fragment key={author.id}>
            <Link href={`${mountAt}/author/` + author.slug} key={`author-image-${index}`} aria-label="author-image">
              <div
                styleName={`author-image ${!index ? "first-author-image" : ""} ${
                  !isSingleAuthor ? "multi-author-image" : ""
                }`}>
                {authorImage(author)}
              </div>
            </Link>
          </React.Fragment>
        );
      })}
    </div>
  );
};

AuthorsImage.propTypes = {
  authors: PropTypes.array,
  mountAt: PropTypes.string
};

const AuthorTwitter = ({ twitterUrl, textColor }) => {
  return (
    <>
      {twitterUrl && (
        <a href={twitterUrl} target="_blank" rel="noopener noreferrer">
          <Twitter color={textColor === "dark" ? "#000" : "#fff"} />
        </a>
      )}
    </>
  );
};

AuthorTwitter.propTypes = {
  twitterUrl: PropTypes.string,
  textColor: PropTypes.string
};

const AuthorBio = ({ author, textColor }) => {
  return (
    <div data-test-id="author-info" styleName="author-details-wrapper">
      <p styleName={`author-bio ${textColor}`}>{author.bio}</p>
    </div>
  );
};

AuthorBio.propTypes = {
  author: PropTypes.object,
  textColor: PropTypes.string
};

const AuthorsName = ({ authors, mountAt = "", textColor, showTwitter = false }) => {
  const isSingleAuthor = authors.length === 1;
  let twitterUrl = "";
  if (isSingleAuthor) {
    twitterUrl = getAuthorTwitterUrl(authors[0]);
  }
  const singleAuthorStyle = isSingleAuthor ? "single-author" : "";

  return (
    <div
      data-test-id="author-name"
      styleName={["author-name-share", singleAuthorStyle].join(" ")}
      className="arr-name-share">
      {authors.map((author, index) => {
        const spaceHolder = `,\xa0`;
        return (
          <>
            {index !== 0 && (authors.length > 1 ? spaceHolder : "")}
            <span key={author.id}>
              <Link
                href={`${mountAt}/author/` + author.slug}
                aria-label="author-name"
                styleName={`multiple-author-style ${textColor}`}>
                {author.name}
              </Link>
            </span>
          </>
        );
      })}
      {isSingleAuthor && showTwitter && (
        <div styleName="twitter-wrapper">
          <AuthorTwitter twitterUrl={twitterUrl} textColor={textColor} />
        </div>
      )}
    </div>
  );
};

AuthorsName.propTypes = {
  authors: PropTypes.array,
  mountAt: PropTypes.string,
  textColor: PropTypes.string,
  showTwitter: PropTypes.boolean
};

const DefaultTemplate = ({ authors, clazzName = "", opts = {}, mountAt = "", textColor }) => {
  const mainAuthors = [];
  const guestAuthors = [];
  const template = "default";

  const {
    showImage = true,
    showName = true,
    showLabels = false,
    showGuestAuthorName = false,
    showGuestAuthorImage = false,
    localizedAuthorLabel,
    localizedGuestAuthorLabel
  } = opts;

  const finalAuthorLabel = localizedAuthorLabel || "Author";
  const finalGuestAuthorLabel = localizedGuestAuthorLabel || "Guest Author";

  authors.forEach((author) => {
    if (!author["contributor-role"] || author["contributor-role"].name === "Author") {
      mainAuthors.push(author);
    } else if (author["contributor-role"].name === "Guest Author") {
      guestAuthors.push(author);
    }
  });

  const isGuestAuthorsPresent = guestAuthors.length > 0;
  return (
    <>
      <div data-test-id={`author-card-${kebabCase(template)}`} className={`${!showImage ? "author-card-wrapper" : ""}`}>
        <div styleName={`author-card-wrapper ${template}`} className={clazzName}>
          {showLabels && mainAuthors.length > 0 && (showName || showImage) && (
            <span styleName={`${textColor} author-card-label`}>{`${finalAuthorLabel}:`}</span>
          )}
          {showImage && <AuthorsImage authors={mainAuthors} mountAt={mountAt} />}
          {showName && <AuthorsName authors={mainAuthors} mountAt={mountAt} textColor={textColor} showTwitter={true} />}
        </div>
      </div>
      <div
        data-test-id={`author-card-${kebabCase(template)}`}
        className={`${!showGuestAuthorImage ? "author-card-wrapper" : ""}`}>
        <div
          styleName={`author-card-wrapper ${template} ${isGuestAuthorsPresent ? "guest-author-wrapper" : ""}`}
          className={clazzName}>
          {showLabels && isGuestAuthorsPresent && (showGuestAuthorName || showGuestAuthorImage) && (
            <span styleName={`${textColor} author-card-label`}>{`${finalGuestAuthorLabel}:`}</span>
          )}
          {showGuestAuthorImage && <AuthorsImage authors={guestAuthors} mountAt={mountAt} />}
          {showGuestAuthorName && (
            <AuthorsName authors={guestAuthors} mountAt={mountAt} textColor={textColor} showTwitter={true} />
          )}
        </div>
      </div>
    </>
  );
};

DefaultTemplate.propTypes = {
  opts: PropTypes.shape({
    showImage: PropTypes.bool,
    showBio: PropTypes.bool,
    showName: PropTypes.bool,
    showLabels: PropTypes.bool,
    showGuestAuthorName: PropTypes.bool,
    showGuestAuthorImage: PropTypes.bool,
    localizedAuthorLabel: PropTypes.string,
    localizedGuestAuthorLabel: PropTypes.string
  }),
  mountAt: PropTypes.string,
  clazzName: PropTypes.string,
  textColor: PropTypes.string,
  authors: PropTypes.array
};

export const AuthorCard = ({ story = {}, template = "default", clazzName = "", opts = {}, mountAt = "" }) => {
  const configData = useStateValue() || {};
  const { authors = [] } = story;

  const { showBio = false, showImage = true, showName = true } = opts;

  const textColor = getTextColor(configData.theme);

  const isSingleAuthor = authors.length === 1; // have to remove

  if (template === "default")
    return (
      <DefaultTemplate authors={authors} clazzName={clazzName} opts={opts} mountAt={mountAt} textColor={textColor} />
    );

  const flexType = authors.length > 1 ? "column" : "row";

  return (
    <div
      data-test-id={`author-card-${kebabCase(template)}`}
      className={clazzName}
      styleName={`author-card-wrapper ${template}`}>
      {showImage && <AuthorsImage authors={authors} mountAt={mountAt} />}
      {showName && (
        <AuthorsName
          authors={authors}
          mountAt={mountAt}
          textColor={textColor}
          showTwitter={template !== "centerAligned"}
        />
      )}
      {showBio && isSingleAuthor && <AuthorBio author={authors[0]} textColor={textColor} />}
    </div>
  );
};

AuthorCard.propTypes = {
  story: PropTypes.shape({
    authors: PropTypes.array
  }),
  template: PropTypes.string,
  opts: PropTypes.shape({
    showImage: PropTypes.bool,
    showBio: PropTypes.bool,
    showName: PropTypes.bool,
    showLabels: PropTypes.bool,
    showGuestAuthorName: PropTypes.bool,
    showGuestAuthorImage: PropTypes.bool,
    localizedAuthorLabel: PropTypes.string,
    localizedGuestAuthorLabel: PropTypes.string
  }),
  mountAt: PropTypes.string,
  clazzName: PropTypes.string
};
