import { object, func, bool, array } from "prop-types";
import React, { useEffect, useState } from "react";

const ActiveSubscriptions = ({ subscriptions = [] }) => {
  console.log({ subscriptions });
  const [activePlans, setActivePlans] = useState([]);
  const [collections, setCollections] = useState({});

  useEffect(() => {
    const activeSubscriptions = subscriptions
      .filter((plan) => plan.subscription_type === "standard" || plan.subscription_type === "group_access")
      .filter((plan) => plan.status === "active");
    setActivePlans(activeSubscriptions);
  }, [subscriptions]);

  useEffect(() => {
    const currentURL = window.location.href;
    const parts = currentURL.split("/");
    const collectionSlug = parts[parts.length - 1];
    console.log({ collectionSlug });
    fetch("https://malibu-perfadvanced.quintype.io/api/v1/collections/home", { mode: "no-cors" })
      .then((response) => response.json())
      .then((data) => {
        setCollections(data);
        console.log({ data });
      });
  }, []);
  console.log({ collections });

  if (activePlans.length === 0) return <a href="/subscription">Subscribe</a>;

  const isPlanAccessible = (plan, collection) => {
    const planStart = new Date(plan.start_timestamp);
    const planEnd = new Date(plan.end_timestamp);
    const collectionCreationDate = collection["collection-date"];

    const pdfFileURL = collections.metadata["pdf-src-key"]["pdf-file-url"];
    console.log({ pdfFileURL });

    return planStart <= collectionCreationDate && planEnd >= collectionCreationDate;
  };

  let hasAccessToDownload = false;
  if (activePlans.length > 0 && Object.keys(collections).includes("collection-date")) {
    console.log("Subscription Start date: ", new Date(activePlans[0].start_timestamp));
    console.log("Subscription End date: ", new Date(activePlans[0].end_timestamp));
    console.log("Magazine Created date: ", new Date(collections["collection-date"]));
    hasAccessToDownload = isPlanAccessible(activePlans[0], collections);
  }

  return (
    <div>
      {hasAccessToDownload ? (
        <a href="https://www.africau.edu/images/default/sample.pdf">DOWNLOAD</a>
      ) : (
        <p>has no access to download</p>
      )}
    </div>
  );
};

ActiveSubscriptions.propTypes = {
  subscriptions: array,
};

export const MagazinePageWithAccesstype = ({ member, getSubscriptionForUser, isATGlobal, initAccessType }) => {
  const [subscriptions, setSubscriptions] = useState(null);

  useEffect(() => {
    initAccessType(() => {
      getSubscriptionForUser()
        .then((res) => {
          setSubscriptions(res.subscriptions);
        })
        .catch((err) => console.error("Error occurred inside profile page --->", err));
    });
  }, [global.AccessType, member, isATGlobal]);

  return (
    <ol>
      {subscriptions === null ? (
        <div>
          <b>Loading...</b>
          <p>We are finding your subscriptions, Please wait</p>
        </div>
      ) : (
        <ActiveSubscriptions subscriptions={subscriptions} />
      )}
    </ol>
  );
};

MagazinePageWithAccesstype.propTypes = {
  initAccessType: func,
  member: object,
  getSubscriptionForUser: func,
  isATGlobal: bool,
};
