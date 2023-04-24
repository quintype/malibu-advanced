import React from "react";

import { TopBar } from "./top-bar";
import { AccessType } from "@quintype/components";
import { useSelector } from "react-redux";
import get from "lodash/get";

// Common wrapper for navigation. We could add OffcanvasMenu, Navbar etc components here.

const Header = () => {
  const member = useSelector((state) => get(state, ["member"], null));
  const email = get(member, ["email"], "abc@email.com");
  const phone = get(member, ["metadata", "phone-number"], "1234");
  const { key, accessTypeBkIntegrationId } = useSelector((state) =>
    get(state, ["qt", "config", "publisher-attributes", "accesstypeConfig"], {})
  );

  return (
    <AccessType
      enableAccesstype={true}
      isStaging={true}
      accessTypeKey={key}
      email={email}
      phone={phone}
      accessTypeBkIntegrationId={accessTypeBkIntegrationId}
    >
      {({ initAccessType }) => <TopBar initAccessType={initAccessType} />}
    </AccessType>
  );
};

export { Header };
