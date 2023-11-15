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
    // fetch("https://malibu-perfadvanced.quintype.io/api/v1/collections/home", { mode: "no-cors" })
    //   .then((response) => response.json())
    //   .then((data) => {
    //     setCollections(data);
    //     console.log({ data });
    //   });
    const collections = {
      "updated-at": 1699521209994,
      "collection-cache-keys": ["c/2354/138768"],
      slug: "january-2019",
      fallback: false,
      name: "January 2019",
      "data-source": "manual",
      automated: false,
      template: "default",
      rules: {},
      summary: null,
      id: 138768,
      "total-count": 1,
      "collection-date": 1546428039000,
      items: [
        {
          id: "2379d733-4d09-47d5-8e51-5ac763bf7b8d",
          "associated-metadata": {},
          type: "story",
          story: {
            "updated-at": 1695196097654,
            seo: {
              "meta-description": "Winter 2018 Fashion Trends: The Only Looks You Need to Know",
              "meta-title": "Winter 2018 Fashion Trends: The Only Looks You Need to Know",
              "meta-keywords": [""],
              "claim-reviews": {
                story: null,
              },
            },
            "assignee-id": 1831262,
            "author-name": "harshith",
            tags: [],
            headline: "Winter 2018 Fashion Trends: The Only Looks You Need to Know",
            "storyline-id": null,
            votes: {},
            "story-content-id": "2379d733-4d09-47d5-8e51-5ac763bf7b8d",
            slug: "celebrity/heres-every-single-model-walking-in-the-2018-victorias-secret-fashion-show",
            "last-published-at": 1546428039000,
            "public-identifier": null,
            subheadline: null,
            alternative: {},
            sections: [
              {
                "domain-slug": null,
                slug: "celebrity",
                name: "celebrity",
                "section-url": "https://vyshnav.madrid.quintype.io/section/celebrity",
                id: 60261,
                "parent-id": null,
                "display-name": "Celebrity",
                collection: {
                  slug: "celebrity",
                  name: "celebrity",
                  id: 138755,
                },
                data: null,
              },
            ],
            "read-time": 3,
            "access-level-value": null,
            "content-created-at": 1694675107717,
            "is-embargoed": false,
            "owner-name": "harshith",
            "custom-slug": null,
            "push-notification": null,
            "publisher-id": 2354,
            "hero-image-metadata": null,
            comments: null,
            "word-count": 669,
            entities: {},
            "published-at": 1546428039000,
            "embargoed-till": null,
            "breaking-news-linked-story-id": null,
            "storyline-title": null,
            summary: null,
            "push-notification-title": null,
            "external-id": "wordpress-45",
            "canonical-url": null,
            "hero-image-hyperlink": null,
            autotags: [],
            "linked-entities": [],
            status: "published",
            "hero-image-attribution": null,
            "bullet-type": "123",
            id: "2379d733-4d09-47d5-8e51-5ac763bf7b8d",
            "hero-image-s3-key": "vyshnav/import/wp-content/uploads/2019/01/t4-1.jpg",
            contributors: null,
            cards: [
              {
                "story-elements": [
                  {
                    description: "",
                    "page-url":
                      "/story/2379d733-4d09-47d5-8e51-5ac763bf7b8d/element/79b1b1e1-11f7-434b-8103-4d2c8e5de862",
                    type: "text",
                    "family-id": "308ed865-b4bb-458b-a56b-a8534c43d84c",
                    title: "",
                    id: "79b1b1e1-11f7-434b-8103-4d2c8e5de862",
                    metadata: null,
                    subtype: null,
                    text: '<p>The Christmas countdown is officially on! And how do we know? Because the <span style="color: #f75454;">Marks &amp; Spencer Christmas</span> advert has just hit screen. And the star is a certain <span style="color: #090909; font-weight: 600;">Holly Willoughby</span> – and her enviable wardrobe. We can\'t stop thinking about the fabulous purple coat that she wears during the ad – which is <span style="color: #090909; font-weight: 600;">FINALLY</span> available to purchase now.</p>',
                  },
                  {
                    description: "",
                    "page-url":
                      "/story/2379d733-4d09-47d5-8e51-5ac763bf7b8d/element/7b4cbcaa-4763-4957-9606-16541a3b5adf",
                    type: "text",
                    "family-id": "47e77d85-10c3-4e69-94f1-a8bd8bb8a811",
                    title: "",
                    id: "7b4cbcaa-4763-4957-9606-16541a3b5adf",
                    metadata: null,
                    subtype: null,
                    text: '<p>Although it was released in store earlier this month, you can now purchase it online for <span style="color: #090909; font-weight: 600;">£89</span>. The single-breasted design has already proved a massive hit on Instagram, due to not only the <em>gorgeous wide</em> lapels, the on-trend, oversize fit and super cosy wool texture – but also the fact that <span style="color: #f75454;">Vogue Williams</span>, Holly and fashion blogger Erica Davies have all rocked it. Now if you don\'t know who Erica Davies is – let us enlighten you. Erica is a huge fashion influencer and has always been a big fan of <span style="color: #090909;">M&amp;S</span>, having single-handedly made THAT starry-print constellation dress a sellout last year.</p>',
                  },
                  {
                    description: "",
                    "page-url":
                      "/story/2379d733-4d09-47d5-8e51-5ac763bf7b8d/element/22e587b0-6303-4df9-8852-38a7f14216b9",
                    type: "text",
                    "family-id": "14ae26cd-523c-4d11-9cd5-ef51b3428c11",
                    title: "",
                    id: "22e587b0-6303-4df9-8852-38a7f14216b9",
                    metadata: null,
                    subtype: null,
                    text: '<p>Speaking about how to style the purple coat of dreams, the chic mother-of-two advised: &quot;Do not fear the purple hue. It works SO WELL with navy blue, bright yellow (yes really), <span style="color: #090909; font-weight: 600;">orange or red</span> AND emerald green. It\'s a completely useful shade if you want to inject <span style="color: #f75454;"><em>some colour</em></span> into your life. And who doesn\'t want that? We couldn\'t agree more, E.</p>',
                  },
                  {
                    description: "",
                    "page-url":
                      "/story/2379d733-4d09-47d5-8e51-5ac763bf7b8d/element/a2bf4870-6cc6-40a2-9bd3-c6fc2bd215c2",
                    type: "text",
                    "family-id": "033102e5-4661-45a5-8fcb-783e7a200ee6",
                    title: "",
                    id: "a2bf4870-6cc6-40a2-9bd3-c6fc2bd215c2",
                    metadata: null,
                    subtype: null,
                    text: "<p> Second earth deep abundantly winged appear air can't earth</p>",
                  },
                  {
                    description: "",
                    "page-url":
                      "/story/2379d733-4d09-47d5-8e51-5ac763bf7b8d/element/1a8baf2f-879f-46b2-928f-1ccd489a2dc5",
                    type: "text",
                    "family-id": "faa7cc43-3443-46be-90c4-62944a786165",
                    title: "",
                    id: "1a8baf2f-879f-46b2-928f-1ccd489a2dc5",
                    metadata: null,
                    subtype: null,
                    text: "<p>She added: &quot;I used to feel like I could only wear a certain type of clothing and I think sometimes you just get stuck in a bit of a rut and wear the same thing over and over again and you <span style=\"color: #090909;\">create rules</span> for yourself, you think 'ooh I can't wear trousers because I've got a big bum' and you create some sort of rule book of your own and sometimes you've just got to go 'right, I'm going to tear up that rule book and I'm going to experiment or I'm going to find <span style=\"color: #f75454;\"><em>my trouser</em></span>, or I'm going to find my <span style=\"color: #f75454;\">V-neck</span> top or I'm going to find the place that does the perfect T-shirt'. It's about finding the right things.&quot;</p>",
                  },
                  {
                    description: "",
                    "page-url":
                      "/story/2379d733-4d09-47d5-8e51-5ac763bf7b8d/element/3238381d-7cb9-40f4-82a0-f41a41a8ca50",
                    type: "text",
                    "family-id": "7d2811bd-1577-428f-8e01-c2b78b62a7a0",
                    title: "",
                    id: "3238381d-7cb9-40f4-82a0-f41a41a8ca50",
                    metadata: null,
                    subtype: null,
                    text: '<blockquote id="what-is-covid19"><p><span style="font-size: 30px;">&quot;Anyone can get dressed up and glamorous, but it is how people dress in their days off that are the most intriguing.&quot;</span></p></blockquote>',
                  },
                  {
                    description: "",
                    "page-url":
                      "/story/2379d733-4d09-47d5-8e51-5ac763bf7b8d/element/1cd5232d-a16f-4305-a2b4-46142f51c23a",
                    type: "text",
                    "family-id": "4cf8c135-519a-473a-b680-154d0b9e5188",
                    title: "",
                    id: "1cd5232d-a16f-4305-a2b4-46142f51c23a",
                    metadata: null,
                    subtype: null,
                    text: "<p>Ali, who gave birth to the couple's baby daughter Isla in September, looked gorgeous in a black maxi dress that featured an off-the-shoulder neckline. Holly was also her typically stylish self, wearing a white summer dress, while Scarlett looked lovely in a zebra-print number.</p>",
                  },
                  {
                    description: "",
                    "page-url":
                      "/story/2379d733-4d09-47d5-8e51-5ac763bf7b8d/element/d13eb5cc-8415-43f4-af7b-a3dc90e08be9",
                    type: "text",
                    "family-id": "f225a45c-720a-4b23-97a7-1bbad914ccc9",
                    title: "",
                    id: "d13eb5cc-8415-43f4-af7b-a3dc90e08be9",
                    metadata: null,
                    subtype: null,
                    text: "<h4>MIDDLETON'S BABY'S NAME REVEALED</h4>",
                  },
                  {
                    description: "",
                    "page-url":
                      "/story/2379d733-4d09-47d5-8e51-5ac763bf7b8d/element/5fea27f5-6e2e-46ba-acf8-68cceb8d726a",
                    type: "text",
                    "family-id": "bfeab6ff-7736-4e59-b5a7-25398ff9237b",
                    title: "",
                    id: "5fea27f5-6e2e-46ba-acf8-68cceb8d726a",
                    metadata: null,
                    subtype: null,
                    text: "<p>The gang, who were joined by their other female friends and I'm a Celeb co-host Dec, appeared to be in high spirits as they were pictured chatting and laughing. It's all go-go-go for the cast as I'm a <span style=\"color: #f75454;\">Celeb returns</span> on Sunday night. This year's celebrity campmates are expected to be revealed the day before but the various star sightings at <span style=\"color: #090909; font-weight: 600;\">Brisbane Airport</span> have already given the game away.</p>",
                  },
                  {
                    description: "",
                    "page-url":
                      "/story/2379d733-4d09-47d5-8e51-5ac763bf7b8d/element/1b6bc9a7-eeaf-4820-a89d-39a20b2383b1",
                    type: "text",
                    "family-id": "eb609320-afb1-4ef8-8f33-08b2f7809acb",
                    title: "",
                    id: "1b6bc9a7-eeaf-4820-a89d-39a20b2383b1",
                    metadata: null,
                    subtype: null,
                    text: "<ul><li>Presenters Holly and Dec have also been drumming up excitement over on their social media accounts.</li><li>The This Morning star shared a photo of the pair on Instagram.</li><li>Holly and I are looking forward to welcoming you to Australia next Sunday night.</li></ul>",
                  },
                  {
                    description: "",
                    "page-url":
                      "/story/2379d733-4d09-47d5-8e51-5ac763bf7b8d/element/42450a1e-e79c-4e83-a4bc-ba94af70324c",
                    type: "text",
                    "family-id": "b5112734-dda4-4e9e-801e-cb38eff0419f",
                    title: "",
                    id: "42450a1e-e79c-4e83-a4bc-ba94af70324c",
                    metadata: null,
                    subtype: null,
                    text: "<p>There's only a week to go before I'm a Celebrity returns to screens, and ahead of the launch, show's leading ladies have been enjoying some downtime together. <span style=\"color: #f75454;\">Presenter Holly Willoughby</span>, who has stepped in for Ant McPartlin this year, was pictured having a laugh with <em><span style=\"color: #f75454;\">Scarlett Moffatt</span></em>, who co-hosts the spin-off show, I'm a Celebrity: Extra Camp. The TV stars were joined by Declan Donnelly's wife Ali Astall on their day out in New South Wales, Australia.</p>",
                  },
                  {
                    description: "",
                    "page-url":
                      "/story/2379d733-4d09-47d5-8e51-5ac763bf7b8d/element/28c2e75b-7e8b-4df8-a718-0e63ffe1bad2",
                    type: "text",
                    "family-id": "0eab214a-20c5-486f-9b96-027ce80e5278",
                    title: "",
                    id: "28c2e75b-7e8b-4df8-a718-0e63ffe1bad2",
                    metadata: null,
                    subtype: null,
                    text: "<p>Photographed in a suitably verdant setting alongside her co-presenter, Holly looked ready to take on anything with a retro Cowgirl-esque outfit. Dressed in the supercool <em><span style=\"color: #f75454;\">Danish brand Ganni</span></em>, a.k.a the go-to designer for influencers worldwide, Holly wore the ultra cute 'Salvia' suede mini skirt in dark camel with frill detailing that buttoned all the way up at the front.</p>",
                  },
                  {
                    id: "00000000-0000-0000-0000-000000000000",
                    description: "",
                    title: "",
                    subtype: null,
                    type: "text",
                    text: "<div><p>Thank you for reading. All content has been taken from the league of legends universe.</p></div>",
                    metadata: {
                      "promotional-message": true,
                    },
                  },
                ],
                "card-updated-at": 1695196097666,
                "content-version-id": "f93959d0-0e36-4810-bb22-5c180f50ebca",
                "card-added-at": 1695196097666,
                status: "draft",
                id: "e7820368-a080-4f53-8a72-3456197d3b3c",
                "content-id": "e7820368-a080-4f53-8a72-3456197d3b3c",
                version: 1,
                metadata: {
                  "external-id": "new-0.15100923621226847",
                  "social-share": {
                    shareable: false,
                    title: "Winter 2018 Fashion Trends: The Only Looks You Need to Know",
                    message: null,
                    image: {
                      key: "vyshnav/import/wp-content/uploads/2019/01/t4-1.jpg",
                      url: "https://images.assettype.com/vyshnav/import/wp-content/uploads/2019/01/t4-1.jpg",
                      attribution: null,
                      caption: null,
                      metadata: null,
                    },
                  },
                },
              },
            ],
            url: "https://vyshnav.madrid.quintype.io/celebrity/heres-every-single-model-walking-in-the-2018-victorias-secret-fashion-show",
            "story-version-id": "3fa98faa-11af-4ce5-9fe9-8910c8427d1d",
            "content-type": "story",
            "content-updated-at": 1695196097718,
            "author-id": 1831262,
            "owner-id": 1831262,
            "linked-story-ids": [],
            access: "subscription",
            "last-updated-by": {
              "member-name": "harshith",
              "member-id": 1831262,
            },
            "promotional-message":
              "<div><p>Thank you for reading. All content has been taken from the league of legends universe.</p></div>",
            "first-published-at": 1546428039000,
            "hero-image-caption": null,
            version: 7,
            "story-template": "text",
            "sequence-no": null,
            "created-at": 1695196097654,
            authors: [
              {
                slug: "resident",
                social: {},
                name: "Resident",
                "contributor-role": null,
                "avatar-url": null,
                bio: null,
                id: 1831405,
                "avatar-s3-key": null,
                "twitter-handle": null,
              },
            ],
            metadata: {
              "card-share": {
                shareable: false,
              },
            },
            "hero-image-url": "https://images.assettype.com/vyshnav/import/wp-content/uploads/2019/01/t4-1.jpg",
            "publish-at": null,
            "assignee-name": "harshith",
          },
        },
      ],
      "created-at": 1546428039000,
      metadata: {
        "cover-image": {
          "cover-image-metadata": {
            width: 1600,
            height: 1067,
            "mime-type": "image/png",
          },
          caption: "Winter 2018 Fashion Trends: The Only Looks You Need to Know.",
          "cover-image-url": "https://gumlet.assettype.com/resident/wp-content/uploads/2019/01/t4-1.jpg",
          "cover-image-s3-key": "resident/wp-content/uploads/2019/01/t4-1.jpg",
          url: "https://gumlet.assettype.com/resident/wp-content/uploads/2019/01/t4-1.jpg",
        },
        entities: {
          collectionEntities: {
            magazine: [
              {
                id: 88259,
                name: "residentmagazine",
                type: "magazine",
                "entity-type-id": 3500,
                slug: "residentmagazine",
              },
            ],
          },
        },
        "pdf-upload-timestamp": "1699521203648",
        "pdf-src-key": {
          "s3-key": "pdf/vyshnav/2023-11/aa63a738-be82-453d-ab20-ff2a3bb3009e/samplePDF.pdf",
          "pdf-file-url":
            "https://images.assettype.com/pdf/vyshnav/2023-11/aa63a738-be82-453d-ab20-ff2a3bb3009e/samplePDF.pdf",
        },
      },
    };
    setCollections(collections);
  }, []);
  console.log({ collections });

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
        <a href="/subscription">Subscribe</a>
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
