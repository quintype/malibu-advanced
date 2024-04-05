import React from "react";
import { withStore } from "../../../../../storybook";
import { Attachment } from "./index";
import { generateStoryElementData } from "../../../Fixture";
import Readme from "./README.md";

const doc = {
  description: "",
  "page-url": "/story/7155b5c2-80a4-4922-bdf1-73f1ff04311e/element/2f648c29-ef8f-442c-903a-263f82e631dd",
  type: "file",
  "family-id": "95bf1052-d663-446d-ace7-d014325e0027",
  title: "",
  id: "2f648c29-ef8f-442c-903a-263f82e631dd",
  "file-name": "document__7_ (1).docx",
  url: "https://thumbor-stg.assettype.com/ace/2019-08/21f3a19b-1d98-46bc-95e3-a5bdc9045ae9/document__7___1_.docx",
  "s3-key": "ace/2019-08/21f3a19b-1d98-46bc-95e3-a5bdc9045ae9/document__7___1_.docx",
  "content-type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  metadata: {
    "file-size": 8209,
  },
  subtype: "attachment",
};

const pdf = {
  description: "",
  "page-url": "/story/a9068be5-70ce-4d55-86d0-687546f921ea/element/62393c55-50ed-4310-81c2-01cc0ef17446",
  type: "file",
  "family-id": "591f90c3-e98e-43dc-8509-9f11f5335af6",
  title: "",
  id: "62393c55-50ed-4310-81c2-01cc0ef17446",
  "file-name": "resume-samples.pdf",
  url: "https://thumbor-stg.assettype.com/ace/2019-07/6dcf2021-615b-43e6-85f3-21acb8953cea/resume_samples.pdf",
  "s3-key": "ace/2019-07/6dcf2021-615b-43e6-85f3-21acb8953cea/resume_samples.pdf",
  "content-type": "application/pdf",
  metadata: {
    "file-size": 301808,
  },
  subtype: "attachment",
};
const element = generateStoryElementData("attachment");
withStore("Atoms/Story Elements/Attachment", Readme)
  .add("PDF", () => <Attachment element={pdf} />)
  .add("DOC", () => <Attachment element={doc} />)
  .add("Custom", () => {
    // eslint-disable-next-line react/prop-types
    const customTemplate = ({ element }) => <h3 dangerouslySetInnerHTML={{ __html: element["file-name"] }} />;
    return <Attachment element={element} render={customTemplate} />;
  });
