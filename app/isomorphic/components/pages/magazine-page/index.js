import { AccessType } from "@quintype/components";
import get from "lodash/get";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { MagazinePageWithAccesstype } from "./MagazinePageWithAccesstype";

export function MagazinePage() {
  const [isATGlobal, setIsATGlobal] = useState(false);
  const member = useSelector((state) => get(state, ["member"], null));
  const email = get(member, ["email"], "");
  const phone = get(member, ["metadata", "phone-number"], "");
  const { key, accessTypeBkIntegrationId } = useSelector((state) =>
    get(state, ["qt", "config", "publisher-attributes", "accesstypeConfig"], {})
  );
  console.log(key, accessTypeBkIntegrationId);
  return (
    <AccessType
      enableAccesstype={true}
      accessTypeKey={key}
      email={email}
      phone={phone}
      accessTypeBkIntegrationId={accessTypeBkIntegrationId}
      onATGlobalSet={() => {
        setIsATGlobal(true);
      }}
    >
      {({ initAccessType, getSubscriptionForUser }) => (
        <MagazinePageWithAccesstype
          member={member}
          getSubscriptionForUser={getSubscriptionForUser}
          isATGlobal={isATGlobal}
          initAccessType={initAccessType}
        />
      )}
    </AccessType>
  );
}
