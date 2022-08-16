import React from "react";
import PropTypes from "prop-types";
import "./attachment.m.css";
import { Link } from "@quintype/components";
import { withElementWrapper } from "../withElementWrapper";
import { useStateValue } from "../../../SharedContext";
import { getTextColor } from "../../../../utils/utils";

const AttachmentBase = ({ element = {}, render, ...restProps }) => {
  const { "file-name": fileName, url, "content-type": contentType } = element;

  if (!contentType || !url) return null;
  const attachmentType = { PDF: "application/pdf" };
  const isPdf = contentType === attachmentType.PDF;
  const configData = useStateValue() || {};
  const textColor = getTextColor(configData.theme);
  const defaultName = isPdf ? "Attached PDF" : "Attached DOC";
  const defaultFileName = fileName || defaultName;

  return (
    <div
      data-test-id="attachment"
      className="arrow-component arr--attachment-element"
      styleName={textColor}
      {...restProps}>
      <div styleName="headline">Attachment</div>
      <div styleName="wrapper">
        {isPdf ? (
          <div data-test-id="pdf" styleName="pdf">
            PDF
          </div>
        ) : (
          <div data-test-id="doc" styleName="doc">
            DOC
          </div>
        )}
        <div styleName="content-wrapper">
          <div styleName="file-name" dangerouslySetInnerHTML={{ __html: defaultFileName }} />
          <Link
            styleName="button-wrapper"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            download
            aria-label="button">
            {isPdf ? "Preview" : "Download"}
          </Link>
        </div>
      </div>
    </div>
  );
};

AttachmentBase.propTypes = {
  element: PropTypes.shape({
    url: PropTypes.string,
    fileName: PropTypes.string,
    contentType: PropTypes.string
  }),
  render: PropTypes.func
};
export const Attachment = withElementWrapper(AttachmentBase);
