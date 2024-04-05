import React from "react";
import PropTypes from "prop-types";
import { ResponsiveImage, Link } from "@quintype/components";
import { UserFallbackIcon } from "../../Svgs/user-fallback-icon";
import "./author-image.m.css";

const authorWithImage = (author, templateStyle) => {
  const { "avatar-url": avatarUrl, "avatar-s3-key": avatarS3Key, name } = author;
  return (
    <div className="arr--author-image" styleName={`author-image ${templateStyle}`} data-test-id="author-image">
      <figure styleName="image-container">
        {avatarS3Key ? (
          <ResponsiveImage
            slug={avatarS3Key}
            alt={name}
            defaultWidth={250}
            widths={[250, 480]}
            aspectRatio={[
              [1, 1],
              [1, 1],
            ]}
            imgParams={{ auto: ["format", "compress"] }}
          />
        ) : avatarUrl ? (
          <img src={avatarUrl} alt={name} />
        ) : (
          <UserFallbackIcon />
        )}
      </figure>
    </div>
  );
};

const AuthorImage = ({ author = {}, template = "", config = {} }) => {
  const { slug } = author;
  const mountAt = config.mountAt || "";
  let templateStyle = "";

  if (template === "smallerCircle") templateStyle = "smaller-circle";
  else if (template === "smallCircle") templateStyle = "small-circle";
  else if (template === "square") templateStyle = "square";

  if (slug) return <Link href={`${mountAt}/author/` + slug}>{authorWithImage(author, templateStyle)}</Link>;
  else return authorWithImage(author, templateStyle);
};

AuthorImage.propTypes = {
  author: PropTypes.shape({
    "avatar-url": PropTypes.string,
    "avatar-s3-key": PropTypes.string,
    name: PropTypes.string,
    slug: PropTypes.string,
  }),
  template: PropTypes.string,
  config: PropTypes.object,
};

export default AuthorImage;
