import React, { useState, Suspense, lazy } from "react";
import { useSelector } from "react-redux";
import get from "lodash.get";
import PropTypes from "prop-types";
import "./fullscreenimages.scss";
import { Loading } from "../../Svgs/Loading/loading";
import { HyperLink } from "../../Atoms/Hyperlink";

const Lightbox = lazy(() => import("react-image-lightbox"));

export const FullScreenImages = ({ imageSlug = "", template, element = {}, props }) => {
  const cdnImage = useSelector((state) => get(state, ["qt", "config", "cdn-image"]));
  let [photoIndex, handleImage] = useState(0);
  let [isOpen, handleOpen] = useState(false);
  const deviceWidth = get(global, ["innerWidth"], 0);

  const hyperlinks = get(element, ["story-elements"], []).map((image) => image.hyperlink);

  let imageUrlList = [];
  if (!imageSlug) {
    imageUrlList = get(element, ["story-elements"], []).map(
      (image) => `//${cdnImage}/${image["image-s3-key"]}?w=${deviceWidth}`
    );
  }

  const onClickHandler = (index) => {
    handleOpen(true);
    handleImage(index);
  };
  const onClickKey = imageSlug ? "onClick" : "onClickHandler";

  const imageUrlListLength = imageUrlList.length;
  const onMoveNext = (imageUrlListLength) => {
    const next = (photoIndex + 1) % imageUrlListLength;
    handleImage(next);
  };

  const onMovePrev = (imageUrlListLength) => {
    const prev = (photoIndex + imageUrlListLength - 1) % imageUrlListLength;
    handleImage(prev);
  };

  const onClose = () => {
    handleImage(0);
    handleOpen(false);
  };

  const getHyperLink = () => {
    if (element.hyperlink || hyperlinks[photoIndex]) {
      return <HyperLink hyperLink={element.hyperlink || hyperlinks[photoIndex]} />;
    }
    return null;
  };

  const lightboxProps = imageSlug
    ? {
        mainSrc: `//${cdnImage}/${imageSlug}?w=${deviceWidth}`,
        toolbarButtons: [getHyperLink()]
      }
    : {
        mainSrc: imageUrlList[photoIndex],
        nextSrc: imageUrlList[(photoIndex + 1) % imageUrlListLength],
        prevSrc: imageUrlList[(photoIndex + imageUrlListLength - 1) % imageUrlListLength],
        onMoveNextRequest: () => onMoveNext(imageUrlListLength),
        onMovePrevRequest: () => onMovePrev(imageUrlListLength),
        toolbarButtons: [getHyperLink()]
      };

  const LoadingScreen = () => {
    return (
      <div>
        <Loading />
      </div>
    );
  };

  return (
    <div>
      {React.createElement(template, {
        [onClickKey]: onClickHandler,
        ...props
      })}
      {isOpen ? (
        <Suspense fallback={<LoadingScreen />}>
          <Lightbox wrapperClassName="arr--image-lightbox" onCloseRequest={onClose} {...lightboxProps} />
        </Suspense>
      ) : null}
    </div>
  );
};
FullScreenImages.propTypes = {
  imageSlug: PropTypes.string,
  template: PropTypes.func,
  element: PropTypes.shape({
    "story-elements": PropTypes.array
  }),
  props: PropTypes.object
};
