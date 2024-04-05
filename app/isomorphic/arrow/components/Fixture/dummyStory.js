function createUUID() {
  var dt = new Date().getTime();
  var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    var r = (dt + Math.random() * 16) % 16 | 0;
    dt = Math.floor(dt / 16);
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
  return uuid;
}

export const dummyStory = {
  access: "subscription",
  "updated-at": 1564650013782,
  seo: {
    "claim-reviews": {
      story: null
    }
  },
  "assignee-id": 123981,
  "author-name": "Ravigopal Kesari",
  tags: [
    {
      id: 163455,
      name: "politics",
      "meta-description": null,
      slug: "politics",
      "tag-type": "Tag"
    },
    {
      id: 169510,
      name: "review",
      "meta-description": null,
      slug: "review",
      "tag-type": "Tag"
    }
  ],
  customSlotAfterStory: {
    config: { targetingId: "" },
    layout: "Leaderboard",
    layoutLabel: "Leaderboard",
    type: "ad"
  },
  headline: "Ready Player One review \u2013 Spielberg\u00A0",
  "storyline-id": null,
  votes: {},
  "story-content-id": "a3561065-11ce-4281-9d86-325934aa2146",
  slug: "recent-stories/news/ready-player-one-review-spielberg-spins-a-dizzying-vr-yarn",
  "linked-stories": {
    "2d0008f7-768f-4667-822f-cb531d9627f4": {
      "author-name": "Feed Migrator",
      headline: "How is the coronavirus impacting people with disabilities?",
      "story-content-id": "2d0008f7-768f-4667-822f-cb531d9627f4",
      slug: "coronavirus/how-is-the-coronavirus-impacting-people-with-disabilities",
      sections: [
        {
          "domain-slug": null,
          slug: "coronavirus",
          name: "Coronavirus",
          "section-url": "https://ace-web.qtstage.io/anything/coronavirus",
          id: 42239,
          "parent-id": null,
          "display-name": "Coronavirus",
          collection: {
            slug: "coronavirus",
            name: "Coronavirus",
            id: 92836
          },
          data: null
        }
      ],
      "hero-image-metadata": {
        "original-url": "https://www.aljazeera.com/mritems/Images/2020/4/19/f90b71cdf10141ff9913b72bcfd29768_18.jpg"
      },
      "hero-image-s3-key": "ace/2020-04/9adec2ac-d37c-496f-abcc-98309a4bb356/f90b71cdf10141ff9913b72bcfd29768_18.jpg",
      url: "https://ace-web.qtstage.io/anything/coronavirus/how-is-the-coronavirus-impacting-people-with-disabilities",
      "content-updated-at": 1587491154824,
      "author-id": 934395,
      "first-published-at": 1671083514919,
      authors: [
        {
          id: 934395,
          name: "Feed Migrator",
          slug: "feed-migrator",
          "avatar-url": null,
          "avatar-s3-key": null,
          "twitter-handle": null,
          bio: null
        }
      ]
    }
  },
  "last-published-at": 1564650017054,
  subheadline:
    "This spectacular gaming ride whizzes through a limitless futurescape – while also taking a puzzling detour to the shiny",
  alternative: {
    home: {
      default: {
        headline: "Movie Review: Why Ready Player One is Amazing, immerses viewers ",
        "hero-image": {
          "hero-image-metadata": {
            width: 1080,
            height: 1330,
            "focus-point": [525, 207]
          },
          "hero-image-attribution": "attribution",
          "hero-image-s3-key":
            "ace/2018-01/7f028fc9-48fa-4e6c-b2b3-8baf1e6e8928/22520141_862918130543643_474831853139210771_o.jpg",
          "hero-image-caption": "",
          "hero-image-url":
            "https://thumbor-stg.assettype.com/ace/2018-01/7f028fc9-48fa-4e6c-b2b3-8baf1e6e8928/22520141_862918130543643_474831853139210771_o.jpg",
          "temporary-hero-image-key": null
        }
      }
    }
  },
  sections: [
    {
      "domain-slug": null,
      slug: "news",
      name: "News",
      "section-url": "https://ace-web.qtstage.io/section/news",
      id: 5670,
      "parent-id": 5773,
      "display-name": "News ",
      collection: {
        slug: "news",
        name: "News",
        id: 3795
      },
      data: null
    },
    {
      "domain-slug": null,
      slug: "recent-stories",
      name: "Recent stories",
      "section-url": "https://ace-web.qtstage.io/anything/recent-stories",
      id: 5773,
      "parent-id": null,
      "display-name": "Recent stories",
      collection: {
        slug: "recent",
        name: "Recent stories",
        id: 2760
      },
      data: null
    },
    {
      "domain-slug": null,
      slug: "film",
      name: "Film",
      "section-url": "https://ace-web.qtstage.io/section/film",
      id: 5749,
      "parent-id": 5670,
      "display-name": "Film Display name",
      collection: {
        slug: "film-manual-collection",
        name: "Film",
        id: 2725
      },
      data: null
    }
  ],
  "story-audio": {
    "s3-key": "story-audio/ace/2019-08/a3561065-11ce-4281-9d86-325934aa2146/12132634-d337-471b-9e92-1ce7b4d15bfb.mp3"
  },
  "read-time": 2,
  "access-level-value": 23,
  "content-created-at": 1524115986915,
  "owner-name": "Ravigopal Kesari",
  "custom-slug": null,
  "push-notification": null,
  "publisher-id": 97,
  "hero-image-hyperlink": "https://www.google.com",
  "hero-image-metadata": {
    width: 1920,
    height: 1080,
    "mime-type": "image/png",
    "file-size": 587085,
    "file-name": "ready-player-one-hd-wallpapers-70749-6537851.png",
    "focus-point": [883, 411]
  },
  comments: null,
  "word-count": 323,
  entities: {},
  "published-at": 1564650017054,
  "is-live-blog": false,
  "breaking-news-linked-story-id": null,
  "storyline-title": null,
  summary:
    "Passport is authentication middleware for Node. It is designed to serve a singular purpose: authenticate requests. When writing modules, encapsulation is a virtue, so Passport delegates all other functionality to the application. This separation of concerns keeps code clean and maintainable, and makes Passport extremely easy to integrate into an application.",
  "push-notification-title": null,
  "external-id": null,
  "canonical-url": null,
  "is-amp-supported": false,
  autotags: [],
  "linked-entities": [],
  status: "published",
  "hero-image-attribution": "Quis Nostrud",
  "bullet-type": "123",
  id: createUUID(),
  "hero-image-s3-key":
    "ace/2018-01/7f028fc9-48fa-4e6c-b2b3-8baf1e6e8928/22520141_862918130543643_474831853139210771_o.jpg",
  contributors: [],
  "associated-series-collection-ids": [],
  cards: [
    {
      "story-elements": [
        {
          description: "",
          "embed-js":
            "PGlmcmFtZSBzcmM9Jy8vcGxheWVycy5icmlnaHRjb3ZlLm5ldC82MTM5ODI1NDc4MDAxL2RlZmF1bHRfZGVmYXVsdC9pbmRleC5odG1sP3ZpZGVvSWQ9NjMxOTg4MDI0NDExMicgYWxsb3dmdWxsc2NyZWVuIGZyYW1lYm9yZGVyPTA+PC9pZnJhbWU+",
          "page-url": "/story/b7b6ecab-2b4f-4dc1-b04a-0b0ec76a50c4/element/f4dc8f57-8a79-4b96-bc4b-7c4c5d481373",
          type: "jsembed",
          "family-id": "96bea74a-8fed-43f0-9624-a5c9686e1062",
          title: "",
          id: "f4dc8f57-8a79-4b96-bc4b-7c4c5d481373",
          metadata: {},
          subtype: null
        },
        {
          description: "",
          "page-url": "/story/b7b6ecab-2b4f-4dc1-b04a-0b0ec76a50c4/element/2cfc6b4e-85fb-47b0-ae4e-580a650372f7",
          type: "external-file",
          "family-id": "0148ec01-3c7c-49ee-8a3f-db8ca4907dc8",
          title: "",
          "file-type": "video",
          id: "2cfc6b4e-85fb-47b0-ae4e-580a650372f7",
          url: null,
          "content-type": "video/brightcove",
          metadata: {
            "account-id": "1752604059001",
            "player-id": "default",
            "player-media": "default",
            "video-id": "6156696074001",
            "embed-code":
              "aHR0cHM6Ly9wbGF5ZXJzLmJyaWdodGNvdmUubmV0LzI3NjY2MjQ5MDUwMDEvZGVmYXVsdF9kZWZhdWx0L2luZGV4Lmh0bWw/dmlkZW9JZD02MzIzMDIxNjcxMTEy",
            "player-url": "//players.brightcove.net/2766624905001/default_default/index.html?videoId=6323021671112"
          },
          subtype: "brightcove-video"
        },
        {
          description: "",
          "embed-js":
            "PHNjcmlwdCBzcmM9Imh0dHBzOi8vZ2VvLmRhaWx5bW90aW9uLmNvbS9wbGF5ZXIveDc4NTlBLmpzIiBkYXRhLXZpZGVvPSJ4ODRzaDg3Ij48L3NjcmlwdD4=",
          "page-url": "/story/88553fe8-640b-4023-90de-d82e4843d7e5/element/ccbe1571-6b25-4f1d-aea0-135622d378e3",
          type: "jsembed",
          "family-id": "2a419ba5-064d-44c9-b5af-59f284f4c4b1",
          title: "",
          id: "ccbe1571-6b25-4f1d-aea0-135622d378e3",
          metadata: {
            "video-id": "xjzije",
            "dailymotion-url": "https://www.dailymotion.com/video/xjzije",
            provider: "dailymotion-video",
            "player-id": "x7859A"
          },
          subtype: "dailymotion-embed-script"
        },
        {
          description: "",
          "page-url": "/story/191d390f-7f10-422a-86b5-cf589a0bac08/element/813676c9-6606-4fa9-a25a-70b9910e4631",
          type: "text",
          "family-id": "9309e866-a7e2-475d-b41d-e285c9029b9b",
          title: "",
          id: "813676c9-6606-4fa9-a25a-70b9910e4631",
          metadata: {
            content: "Quote: Rajasthan Chief Minister Ashok",
            attribution: "Ashok"
          },
          subtype: "quote",
          text:
            '<div><blockquote>Quote: Rajasthan Chief Minister Ashok</blockquote><span class="attribution">Ashok</span></div>'
        },
        {
          description: "",
          "page-url": "/story/191d390f-7f10-422a-86b5-cf589a0bac08/element/9ee341b5-464a-4d91-a567-258a7cc90db2",
          type: "title",
          "family-id": "75bc3d37-489a-4e28-b7a0-3831aafe2bd5",
          title: "",
          id: "9ee341b5-464a-4d91-a567-258a7cc90db2",
          metadata: {},
          subtype: null,
          text: "Title element"
        },

        {
          description: "",
          "page-url": "/story/a3561065-11ce-4281-9d86-325934aa2146/element/c529557b-a4f5-4363-ba3f-7ac0eb14f299",
          type: "text",
          "family-id": "2b7c81f0-98f6-416c-9692-90ba504c9385",
          title: "",
          id: "c529557b-a4f5-4363-ba3f-7ac0eb14f299",
          metadata: {},
          subtype: null,
          text:
            '<p><a href="https://www.theguardian.com/technology/virtual-reality">Virtual reality</a> is the air guitar solo of modern cinema: a frenetic imagined activity in a made-up world that exists one level below the already made-up world of the story. <a href="https://www.theguardian.com/film/stevenspielberg">Steven Spielberg</a> 2019s <a href="https://www.theguardian.com/film/ready-player-one">Ready Player One</a>.</p>'
        },
        {
          description: "",
          "page-url": "/story/49ed61fb-647e-4d23-9097-3c5088cc3fa7/element/d08cb2d1-0316-4af3-ad93-192824111745",
          type: "text",
          "family-id": "7e42ab53-fb73-49e9-b0fe-51a889cd3f97",
          title: "",
          id: "d08cb2d1-0316-4af3-ad93-192824111745",
          metadata: {
            "cta-title": "CTA text button",
            "cta-url": "https://www.google.com",
            "open-in-new-tab": true,
            "no-follow": true
          },
          subtype: "cta",
          text:
            '<a class="cta-anchor" href="https://www.google.com" target="_blank" rel="nofollow"><span class="cta-text">CTA text button</span></a>'
        },
        {
          description: "",
          "embed-js":
            "PGlmcmFtZSBmcmFtZWJvcmRlcj0iMCIgd2lkdGg9IjY0MCIgaGVpZ2h0PSIzNjAiIHNyYz0iaHR0cHM6Ly93d3cuZGFpbHltb3Rpb24uY29tL2VtYmVkL3ZpZGVvL3hlZzRjNCIgYWxsb3dmdWxsc2NyZWVuIGFsbG93PSJhdXRvcGxheSI+PC9pZnJhbWU+",
          "page-url": "/story/6045077d-e166-4423-9505-fd52c8180429/element/2528c79d-9f8a-400c-970f-14685bb547ab",
          type: "jsembed",
          "family-id": "6aee389b-6d0f-4de2-9a7d-07d36c12ac13",
          title: "",
          id: "2528c79d-9f8a-400c-970f-14685bb547ab",
          metadata: {
            "video-id": "xeg4c4",
            "dailymotion-url": "https://www.dailymotion.com/video/xeg4c4",
            provider: "dailymotion-video"
          },
          subtype: "dailymotion-video"
        },
        {
          description: "",
          "page-url": "/story/7155b5c2-80a4-4922-bdf1-73f1ff04311e/element/2f648c29-ef8f-442c-903a-263f82e631dd",
          type: "file",
          "family-id": "95bf1052-d663-446d-ace7-d014325e0027",
          title: "",
          id: "2f648c29-ef8f-442c-903a-263f82e631dd",
          "file-name": "document__7_ (1).docx",
          url:
            "https://thumbor-stg.assettype.com/ace/2019-08/21f3a19b-1d98-46bc-95e3-a5bdc9045ae9/document__7___1_.docx",
          "s3-key": "ace/2019-08/21f3a19b-1d98-46bc-95e3-a5bdc9045ae9/document__7___1_.docx",
          "content-type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          metadata: {
            "file-size": 8209
          },
          subtype: "attachment"
        },
        {
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
            "file-size": 301808
          },
          subtype: "attachment"
        },
        {
          "page-url": "/story/ed8a181b-4750-48b9-967e-83f29416ee2a/element/e2478f89-edab-44c8-a7df-6c6c84399c82",
          type: "text",
          "family-id": "481b06ad-edd4-45c1-b8bf-7996dfe0667e",
          title: "",
          id: "e2478f89-edab-44c8-a7df-6c6c84399c82",
          metadata: {
            content: "The human eye can distinguish around 10 million different colors!",
            attribution:
              "Color processing begins at a very early level in the visual system (even within the retina) through initial color opponent mechanisms."
          },
          subtype: "bigfact",
          text:
            '<div><div class="bigfact-title">The human eye can distinguish around 10 million different colors!</div><div class="bigfact-description">Color processing begins at a very early level in the visual system (even within the retina) through initial color opponent mechanisms.</div></div>'
        },
        {
          description: "",
          "page-url": "/story/a3561065-11ce-4281-9d86-325934aa2146/element/d42210d4-4c37-475c-ac6e-414821ad2e57",
          type: "youtube-video",
          "family-id": "43f1bf4c-2144-4f86-b36e-d910ff76eb8d",
          title: "",
          id: "d42210d4-4c37-475c-ac6e-414821ad2e57",
          url: "https://www.youtube.com/watch?v=AST2-4db4ic&feature=youtu.be",
          "embed-url": "https://www.youtube.com/embed/AST2-4db4ic",
          metadata: {},
          subtype: null
        },
        {
          description: "",
          "embed-js":
            "PGlmcmFtZSBmcmFtZWJvcmRlcj0iMCIgd2lkdGg9IjQ4MCIgaGVpZ2h0PSIyNzAiIHNyYz0iaHR0cHM6Ly93d3cuZGFpbHltb3Rpb24uY29tL2VtYmVkL3ZpZGVvL3g1dmxhOGwiIGFsbG93ZnVsbHNjcmVlbiBhbGxvdz0iYXV0b3BsYXkiPjwvaWZyYW1lPg==",
          "page-url": "/story/d52a62c4-bb41-48c8-abd2-6f063c680506/element/c0e49d11-bd5c-4313-a3c8-e276cdf86e9a",
          type: "jsembed",
          "family-id": "94b2feaf-aed2-4e31-b450-5d02b0396d26",
          title: "",
          id: "c0e49d11-bd5c-4313-a3c8-e276cdf86e9a",
          metadata: {
            "dailymotion-url": "https://www.dailymotion.com/video/x5vla8l",
            provider: "dailymotion-video",
            "video-id": "x5vla8l"
          },
          subtype: "dailymotion-video"
        },
        {
          description: "",
          "embed-js":
            "PGJsb2NrcXVvdGUgY2xhc3M9InR3aXR0ZXItdHdlZXQiPjxwIGxhbmc9ImVuIiBkaXI9Imx0ciI+T3VyIHB1cHBpZXMganVzdCBoYWQgdGhlIGJlc3QuIGRheS4gZXZlci48YnI+PGJyPlRoZXkgZ290IHRvIGV4cGxvcmUgdGhlIDxhIGhyZWY9Imh0dHBzOi8vdHdpdHRlci5jb20vR2VvcmdpYUFxdWFyaXVtP3JlZl9zcmM9dHdzcmMlNUV0ZnciPkBHZW9yZ2lhQXF1YXJpdW08L2E+IHdoaWxlIGl0IGlzIGNsb3NlZCB0byB0aGUgcHVibGljLiBUaGV5IG1hZGUgYWxsIHNvcnRzIG9mIGV4Y2l0aW5nIGRpc2NvdmVyaWVzIGFuZCBsb3RzIG9mIG5ldyBmcmllbmRzISA8YSBocmVmPSJodHRwczovL3QuY28vZjBpSFhmcTNBRiI+cGljLnR3aXR0ZXIuY29tL2YwaUhYZnEzQUY8L2E+PC9wPiZtZGFzaDsgQXRsYW50YSBIdW1hbmUgKEBhdGxhbnRhaHVtYW5lKSA8YSBocmVmPSJodHRwczovL3R3aXR0ZXIuY29tL2F0bGFudGFodW1hbmUvc3RhdHVzLzEyNDMyMTg4MzI1ODE0NDc2ODM/cmVmX3NyYz10d3NyYyU1RXRmdyI+TWFyY2ggMjYsIDIwMjA8L2E+PC9ibG9ja3F1b3RlPgo8c2NyaXB0IGFzeW5jIHNyYz0iaHR0cHM6Ly9wbGF0Zm9ybS50d2l0dGVyLmNvbS93aWRnZXRzLmpzIiBjaGFyc2V0PSJ1dGYtOCI+PC9zY3JpcHQ+Cg==",
          "page-url": "/story/1cd537ed-a30f-44c4-ab47-9037364df994/element/92b1c15c-1a3c-40eb-92cb-b5e1f0170c85",
          type: "jsembed",
          "family-id": "295bcd70-a9b8-453d-8f7f-b7a577380db8",
          title: "",
          id: "92b1c15c-1a3c-40eb-92cb-b5e1f0170c85",
          metadata: {
            "tweet-url": "https://twitter.com/atlantahumane/status/1243218832581447683",
            provider: "twitter",
            "tweet-id": "1243218832581447683"
          },
          subtype: "tweet"
        },
        {
          description: "",
          "embed-js":
            "PGJsb2NrcXVvdGUgY2xhc3M9InR3aXR0ZXItdHdlZXQiPjxwIGxhbmc9ImVuIiBkaXI9Imx0ciI+Qm90aCA8YSBocmVmPSJodHRwczovL3R3aXR0ZXIuY29tL1NoYXNoaVRoYXJvb3I/cmVmX3NyYz10d3NyYyU1RXRmdyI+QFNoYXNoaVRoYXJvb3I8L2E+IGFuZCBvdXIgUE0gPGEgaHJlZj0iaHR0cHM6Ly90d2l0dGVyLmNvbS9uYXJlbmRyYW1vZGk/cmVmX3NyYz10d3NyYyU1RXRmdyI+QG5hcmVuZHJhbW9kaTwvYT4gaGF2ZSBzb21ldGhpbmcgaW4gY29tbW9uLiBPbmUgc3BlYWtzIGluIHN1Y2ggaGlnaCBFbmdsaXNoIGFuZCBvbmUgc3BlYWtzIG9uIHN1Y2ggSGlnaCBIaW5kaSB0aGF0IHZlcnkgZmV3IHBlcmNlbnRhZ2Ugb2YgdGhlIHBvcHVsYXRpb24gdW5kZXJzdGFuZCBpdC4g8J+YgPCfmIk8L3A+Jm1kYXNoOyBGYXJhaCBLaGFuIChARmFyYWhLaGFuQWxpKSA8YSBocmVmPSJodHRwczovL3R3aXR0ZXIuY29tL0ZhcmFoS2hhbkFsaS9zdGF0dXMvMTI2MDI0MjI0NTU3NzUxMDkxNj9yZWZfc3JjPXR3c3JjJTVFdGZ3Ij5NYXkgMTIsIDIwMjA8L2E+PC9ibG9ja3F1b3RlPiA8c2NyaXB0IGFzeW5jIHNyYz0iaHR0cHM6Ly9wbGF0Zm9ybS50d2l0dGVyLmNvbS93aWRnZXRzLmpzIiBjaGFyc2V0PSJ1dGYtOCI+PC9zY3JpcHQ+",
          "page-url": "/story/403f862a-703a-4c99-9930-b79a5dfb1775/element/3ea4a656-e20b-4ed3-ba8f-58874b5e8715",
          type: "jsembed",
          "family-id": "b17777d5-73ac-4521-a8c1-7468667d89e9",
          title: "",
          id: "3ea4a656-e20b-4ed3-ba8f-58874b5e8715",
          metadata: {},
          subtype: null
        },
        {
          description: "",
          "image-metadata": {
            width: 6016,
            height: 4016,
            "mime-type": "image/jpeg",
            "focus-point": [2741, 1930]
          },
          "page-url": "/story/560b39d9-ae5b-44ef-acc7-04db4472b4f8/element/6c6cf4a8-6700-4829-8076-88373a1436b1",
          type: "image",
          "family-id": "286afa67-910e-45aa-a795-d13508726663",
          "image-attribution": "Quintype Media Gallery",
          title: "Nature as it's best",
          id: "6c6cf4a8-6700-4829-8076-88373a1436b1",
          "image-s3-key": "demo/2018-11/b1fa99ff-b05d-464b-97b9-83cd8f2bf65d/2072.jpg",
          metadata: {},
          subtype: null,
          hyperlink: "https://www.google.com/"
        },
        {
          description: "",
          "page-url": "/story/a3561065-11ce-4281-9d86-325934aa2146/element/4abd5e1d-4f02-433a-af48-2733a63682b9",
          type: "composite",
          "family-id": "aa26b0a8-f7e2-4466-a1ee-75cfc54c69d1",
          "story-elements": [
            {
              description: "",
              title: "",
              subtype: null,
              metadata: {
                description:
                  "In the year 2045, people can escape their harsh reality in the OASIS, an immersive virtual world where you can go anywhere, do anything, be anyone-the only limits are your own imagination. OASIS creator James Halliday left his immense fortune and control of the Oasis to the winner of a contest designed to find a worthy heir. When unlikely hero Wade Watts conquers the first challenge of the reality-bending treasure hunt, he and his friends-known as the High Five-are hurled into a fantastical universe of discovery and danger to save the OASIS and their world.",
                url: "https://www.rottentomatoes.com/m/ready_player_one/",
                name: "Ready player One review from rotten tomatoes"
              },
              text:
                '<div><p>Ready player One review from rotten tomatoes</p><p><a href="https://www.rottentomatoes.com/m/ready_player_one/">In the year 2045, people can escape their harsh reality in the OASIS, an immersive virtual world where you can go anywhere, do anything, be anyone-the only limits are your own imagination. OASIS creator James Halliday left his immense fortune and control of the Oasis to the winner of a contest designed to find a worthy heir. When unlikely hero Wade Watts conquers the first challenge of the reality-bending treasure hunt, he and his friends-known as the High Five-are hurled into a fantastical universe of discovery and danger to save the OASIS and their world.</a></p></div>',
              id: "47afb0c6-aa50-446c-8e55-c10c604c5246",
              "family-id": "6b236f36-ce8a-4f9a-b70e-844367f13af0",
              type: "text"
            }
          ],
          title: "",
          id: "4abd5e1d-4f02-433a-af48-2733a63682b9",
          metadata: {},
          subtype: "references"
        },
        {
          description: "",
          "page-url": "/story/a3561065-11ce-4281-9d86-325934aa2146/element/80f39709-fdf6-40b4-9d8c-a2db549ce621",
          type: "text",
          "family-id": "338160c1-cb62-4328-b866-abbb13cf0e1b",
          title: "",
          id: "80f39709-fdf6-40b4-9d8c-a2db549ce621",
          metadata: {
            content:
              "After the death of James Halliday, the creator of the virtual reality world, his pre-recorded message reveals the hidden fortune, which makes Wade Watts, a teenager, embark on a quest.",
            attribution: "Player"
          },
          subtype: "quote",
          text:
            '<div><blockquote>After the death of James Halliday, the creator of the virtual reality world, his pre-recorded message reveals the hidden fortune, which makes Wade Watts, a teenager, embark on a quest.</blockquote><span class="attribution">Player</span></div>'
        },
        {
          description: "",
          "page-url": "/story/a3561065-11ce-4281-9d86-325934aa2146/element/b474c23d-d782-49f1-a615-fa03081c46b1",
          type: "text",
          "family-id": "77f6332d-73fb-4255-91bb-e2d714981c82",
          title: "",
          id: "b474c23d-d782-49f1-a615-fa03081c46b1",
          metadata: {
            question:
              '<p>Is Ready Player One book<a href="https://www.jbsimmons.com/blog/books-better-than-movies-ready-player-one"> better </a>than the movie?</p>',
            answer:
              "<p><strong>Ready Player One</strong> is the latest example. I read Earnest Cline's <strong><a href=\"https://www.jbsimmons.com/blog/books-better-than-movies-ready-player-one\">book</a></strong> a couple months before watching Steven Spielberg's <strong>movie</strong>. ... The <strong>book</strong> generally fares <strong>better</strong> with reviewers, averaging 4.6 out of 5 stars on Amazon, while the <strong>movie</strong> scores 73% on Rotten Tomatoes.</p>",
            interviewer: {
              "author-collection-id": null,
              "updated-at": 1565606538341,
              slug: "reena-singh-2",
              "last-name": null,
              "publisher-id": 97,
              name: "Reena Singh",
              "avatar-url":
                "https://thumbor-stg.assettype.com/ace/2019-08/565bba26-4f05-4e63-b619-511a2a2bd5b7/images.jpeg",
              settings: null,
              source: null,
              "first-name": null,
              "communication-email": null,
              bio: null,
              id: 300199,
              "avatar-s3-key": "ace/2019-08/565bba26-4f05-4e63-b619-511a2a2bd5b7/images.jpeg",
              "twitter-handle": null,
              "created-at": 1551268188983,
              metadata: {}
            },
            interviewee: {
              "author-collection-id": null,
              "updated-at": 1565606538341,
              slug: "reena-singh-2",
              "last-name": null,
              "publisher-id": 97,
              name: "Reena Singh",
              "avatar-url":
                "https://thumbor-stg.assettype.com/ace/2019-08/565bba26-4f05-4e63-b619-511a2a2bd5b7/images.jpeg",
              settings: null,
              source: null,
              "first-name": null,
              "communication-email": null,
              bio: null,
              id: 300199,
              "avatar-s3-key": "ace/2019-08/565bba26-4f05-4e63-b619-511a2a2bd5b7/images.jpeg",
              "twitter-handle": null,
              "created-at": 1551268188983,
              metadata: {}
            }
          },
          subtype: "q-and-a",
          text:
            '<div><div class="question"><p>Is Ready Player One book<a href="https://www.jbsimmons.com/blog/books-better-than-movies-ready-player-one"> better </a>than the movie?</p></div><div class="answer"><p><strong>Ready Player One</strong> is the latest example. I read Earnest Cline\'s <strong><a href="https://www.jbsimmons.com/blog/books-better-than-movies-ready-player-one">book</a></strong> a couple months before watching Steven Spielberg\'s <strong>movie</strong>. ... The <strong>book</strong> generally fares <strong>better</strong> with reviewers, averaging 4.6 out of 5 stars on Amazon, while the <strong>movie</strong> scores 73% on Rotten Tomatoes.</p></div></div>'
        },
        {
          description: "",
          "page-url": "/story/a3561065-11ce-4281-9d86-325934aa2146/element/ff83a8d3-1946-4cb3-b52c-135108e54ebd",
          type: "text",
          "family-id": "fb690ed4-60b6-4a46-89f9-ee6f87bfa4c7",
          title: "",
          id: "ff83a8d3-1946-4cb3-b52c-135108e54ebd",
          metadata: {
            interviewer: {
              "author-collection-id": null,
              "updated-at": 1565606538341,
              slug: "reena-singh-2",
              "last-name": null,
              "publisher-id": 97,
              name: "Reena Singh",
              "avatar-url":
                "https://thumbor-stg.assettype.com/ace/2019-08/565bba26-4f05-4e63-b619-511a2a2bd5b7/images.jpeg",
              settings: null,
              source: null,
              "first-name": null,
              "communication-email": null,
              bio: null,
              id: 300199,
              "avatar-s3-key": "ace/2019-08/565bba26-4f05-4e63-b619-511a2a2bd5b7/images.jpeg",
              "twitter-handle": null,
              "created-at": 1551268188983,
              metadata: {}
            }
          },
          subtype: "question",
          text:
            '<p>Is Ready Player One book <a href="https://www.jbsimmons.com/blog/books-better-than-movies-ready-player-one">better</a> than the movie?</p>'
        },
        {
          description: "",
          "page-url": "/story/a3561065-11ce-4281-9d86-325934aa2146/element/ac5e114b-5144-401b-9d60-6e706f708a87",
          type: "text",
          "family-id": "b857e675-9923-47b3-bb2f-a467bbc5977d",
          title: "",
          id: "ac5e114b-5144-401b-9d60-6e706f708a87",
          metadata: {
            interviewee: {
              "author-collection-id": null,
              "updated-at": 1565606538341,
              slug: "reena-singh-2",
              "last-name": null,
              "publisher-id": 97,
              name: "Reena Singh",
              "avatar-url":
                "https://thumbor-stg.assettype.com/ace/2019-08/565bba26-4f05-4e63-b619-511a2a2bd5b7/images.jpeg",
              settings: null,
              source: null,
              "first-name": null,
              "communication-email": null,
              bio: null,
              id: 300199,
              "avatar-s3-key": "ace/2019-08/565bba26-4f05-4e63-b619-511a2a2bd5b7/images.jpeg",
              "twitter-handle": null,
              "created-at": 1551268188983,
              metadata: {}
            }
          },
          subtype: "answer",
          text:
            "<p><strong>Ready Player One</strong> is the latest example. I read Earnest Cline's <strong>book</strong> a couple months before watching Steven Spielberg's <strong>movie</strong>. ... The <strong><a href=\"https://www.jbsimmons.com/blog/books-better-than-movies-ready-player-one\">book</a></strong> generally fares <strong>better</strong> with reviewers, averaging 4.6 out of 5 stars on Amazon, while the <strong>movie</strong> scores 73% on Rotten Tomatoes.</p>"
        },
        {
          id: "00000000-0000-0000-0000-000000000000",
          description: "",
          title: "",
          subtype: null,
          type: "text",
          text: '<p>text <a href="https://ace-web.qtstage.io/">promotional</a> message</p>',
          metadata: {
            "promotional-message": true
          }
        },
        {
          id: "00000000-0000-0000-0000-000000000000",
          description: "",
          title: "",
          subtype: null,
          type: "text",
          text: '<p>text <a href="https://ace-web.qtstage.io/">promotional</a> message</p>',
          metadata: {
            "promotional-message": true
          }
        },
        {
          description: "",
          "page-url": "/story/a3561065-11ce-4281-9d86-325934aa2146/element/0e1e9777-e0e6-45f9-b212-264db2d8eeb5",
          type: "text",
          "family-id": "7be340e2-8e00-4bba-b640-cdbd57ba2719",
          title: "",
          id: "0e1e9777-e0e6-45f9-b212-264db2d8eeb5",
          metadata: {
            content:
              "Although the many story changes might be hard for book purists to accept, Steven Spielberg has lovingly captured the zeitgeist of '80s nostalgia in this adventure."
          },
          subtype: "blurb",
          text:
            '<blockquote>Although the many story changes might be hard for book purists to accept, <a href="https://www.rottentomatoes.com/m/ready_player_one/">Steven Spielberg</a> has lovingly captured the zeitgeist of 80s nostalgia in this adventure.</blockquote>'
        },
        {
          description: "",
          "page-url": "/story/a3561065-11ce-4281-9d86-325934aa2146/element/48546269-f61b-42f3-945c-5358d14f3429",
          type: "text",
          "family-id": "33c7c7c1-1001-46f1-b77d-0553805ded84",
          title: "",
          id: "48546269-f61b-42f3-945c-5358d14f3429",
          metadata: {
            content:
              "After the death of James Halliday, the creator of the virtual reality world, his pre-recorded message reveals the hidden fortune, which makes Wade Watts, a teenager, embark on a quest.",
            attribution: "Player"
          },
          subtype: "blockquote",
          text:
            '<div><blockquote>After the death of James Halliday, the creator of the virtual reality world, his pre-recorded message reveals the hidden fortune, which makes Wade Watts, a teenager, embark on a quest.</blockquote><span class="attribution">Player</span></div>'
        },
        {
          description: "",
          "page-url": "/story/a3561065-11ce-4281-9d86-325934aa2146/element/a0078928-ebb8-4464-a8e6-62e77ca7f502",
          type: "text",
          "family-id": "bc29c3e2-9b21-444b-9e42-359968da256a",
          title: "",
          id: "a0078928-ebb8-4464-a8e6-62e77ca7f502",
          metadata: {
            "linked-story-id": "2d0008f7-768f-4667-822f-cb531d9627f4",
            "linked-story": {
              headline: "How is the coronavirus impacting people with disabilities?",
              "story-content-id": "2d0008f7-768f-4667-822f-cb531d9627f4",
              "highlighted-text": "",
              id: "2d0008f7-768f-4667-822f-cb531d9627f4",
              "highlighted-headline": null
            }
          },
          subtype: "also-read",
          text: "How is the coronavirus impacting people with disabilities?"
        },
        {
          description: "",
          "page-url": "/story/39b60649-aa6f-49f6-8365-0981b799b3b7/element/373d6e0b-c5ac-4904-8d41-78e4fd5602cd",
          type: "text",
          "family-id": "2b60d9a6-355e-45cb-b2a4-e29fde4a4827",
          title: "",
          id: "373d6e0b-c5ac-4904-8d41-78e4fd5602cd",
          metadata: {},
          subtype: "summary",
          text:
            "<p>Lorem<em> Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries</em>, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>"
        },
        {
          description: "",
          "page-url": "/story/8f1c0e1f-afd6-4169-96c2-243d88013bd1/element/b35ef956-35ce-4431-a68d-018760a4ddda",
          type: "composite",
          "family-id": "97761d2a-de16-4135-945f-ac5706ecc1a6",
          "story-elements": [
            {
              description: "",
              "image-metadata": {
                "original-url":
                  "https://www.washingtonpost.com/resizer/_I2QC1BPsP-wxv7XSvBBK48bv8E=/1440x0/smart/arc-anglerfish-washpost-prod-washpost.s3.amazonaws.com/public/OP2ZX3T6KYI6VBGCA6JNQWIZCE.jpg"
              },
              type: "image",
              "family-id": "0444a13c-f52a-43ff-8564-b52411ffdefc",
              "image-attribution": "",
              title: "",
              id: "738163f6-4796-4a44-8e7b-b0160a83fa42",
              "image-s3-key": "ace/2020-04/b6b55f73-a713-4087-849b-a7dbb04826e6/OP2ZX3T6KYI6VBGCA6JNQWIZCE.jpg",
              metadata: {},
              subtype: null,
              hyperlink: "https://www.google.com/"
            },
            {
              description: "",
              "image-metadata": {
                "original-url":
                  "https://media3.s-nbcnews.com/j/newscms/2020_16/3314681/200419-michelle-tom-cover-cs-509p_6155bfe91e67a4f93ecc2cf00530c404.nbcnews-fp-1200-630.jpg"
              },
              type: "image",
              "family-id": "5173f4e7-f94c-4e7a-ba54-806ae1a7deef",
              "image-attribution": "",
              title: "",
              id: "2486b7db-4d88-4fc3-899e-425c105f48ba",
              "image-s3-key":
                "ace/2020-04/e58b991e-4a82-4fca-818d-c1f8fd6e98e6/200419_michelle_tom_cover_cs_509p_6155bfe91e67a4f93ecc2cf00530c404_nbcnews_fp_1200_630.jpg",
              metadata: {},
              subtype: null,
              hyperlink: "https://www.google.com/"
            },
            {
              description: "",
              "image-metadata": {
                "original-url": "https://www.dw.com/image/53181437_304.jpg"
              },
              type: "image",
              "family-id": "5f454472-b7ed-4a18-b923-452332c16125",
              "image-attribution": "",
              title: "",
              id: "3dd778d9-dc96-4798-876f-069b8d47c177",
              "image-s3-key": "ace/2020-04/ea98e4fb-f8a8-4b18-a2b0-8ec03b17820c/53181437_304.jpg",
              metadata: {},
              subtype: null,
              hyperlink: "https://www.google.com/"
            },
            {
              description: "",
              "image-metadata": {
                "original-url":
                  "https://www.washingtonpost.com/resizer/_f5BO1VdLp-O-jX1x-NK-GfYknU=/1440x0/smart/arc-anglerfish-washpost-prod-washpost.s3.amazonaws.com/public/ZE2IQNUBVAI6VBGCA6JNQWIZCE.jpg"
              },
              type: "image",
              "family-id": "67ae55bd-3f34-417b-8951-fb525da321f2",
              "image-attribution": "",
              title: "",
              id: "bc8d79e8-04d5-447e-80b7-99e211b1d1ec",
              "image-s3-key": "ace/2020-04/aef8d5e1-d2fc-4f77-968b-50ff0c4764ea/ZE2IQNUBVAI6VBGCA6JNQWIZCE.jpg",
              metadata: {},
              subtype: null,
              hyperlink: "https://www.google.com/"
            },
            {
              description: "",
              "image-metadata": {
                "original-url":
                  "https://www.washingtonpost.com/resizer/_f5BO1VdLp-O-jX1x-NK-GfYknU=/1440x0/smart/arc-anglerfish-washpost-prod-washpost.s3.amazonaws.com/public/ZE2IQNUBVAI6VBGCA6JNQWIZCE.jpg"
              },
              type: "image",
              "family-id": "67ae55bd-3f34-417b-8951-fb525da321f2",
              "image-attribution": "",
              title: "",
              id: "bc8d79e8-04d5-447e-80b7-99e211b1d1ec",
              "image-s3-key": "ace/2020-04/aef8d5e1-d2fc-4f77-968b-50ff0c4764ea/ZE2IQNUBVAI6VBGCA6JNQWIZCE.jpg",
              metadata: {},
              subtype: null,
              hyperlink: "https://www.google.com/"
            },
            {
              description: "",
              "image-metadata": {
                "original-url":
                  "https://www.washingtonpost.com/resizer/_f5BO1VdLp-O-jX1x-NK-GfYknU=/1440x0/smart/arc-anglerfish-washpost-prod-washpost.s3.amazonaws.com/public/ZE2IQNUBVAI6VBGCA6JNQWIZCE.jpg"
              },
              type: "image",
              "family-id": "67ae55bd-3f34-417b-8951-fb525da321f2",
              "image-attribution": "",
              title: "",
              id: "bc8d79e8-04d5-447e-80b7-99e211b1d1ec",
              "image-s3-key": "ace/2020-04/aef8d5e1-d2fc-4f77-968b-50ff0c4764ea/ZE2IQNUBVAI6VBGCA6JNQWIZCE.jpg",
              metadata: {},
              subtype: null,
              hyperlink: "https://www.google.com/"
            },
            {
              description: "",
              "image-metadata": {
                "original-url":
                  "https://www.washingtonpost.com/resizer/_f5BO1VdLp-O-jX1x-NK-GfYknU=/1440x0/smart/arc-anglerfish-washpost-prod-washpost.s3.amazonaws.com/public/ZE2IQNUBVAI6VBGCA6JNQWIZCE.jpg"
              },
              type: "image",
              "family-id": "67ae55bd-3f34-417b-8951-fb525da321f2",
              "image-attribution": "",
              title: "",
              id: "bc8d79e8-04d5-447e-80b7-99e211b1d1ec",
              "image-s3-key": "ace/2020-04/aef8d5e1-d2fc-4f77-968b-50ff0c4764ea/ZE2IQNUBVAI6VBGCA6JNQWIZCE.jpg",
              metadata: {},
              subtype: null,
              hyperlink: "https://www.google.com/"
            },
            {
              description: "",
              "image-metadata": {
                "original-url":
                  "https://www.aljazeera.com/mritems/Images/2020/4/19/e69c7b29e024420d95e519b96edfc7aa_18.jpg"
              },
              type: "image",
              "family-id": "096ff456-dd70-45f8-9953-4ac78c6c332c",
              "image-attribution": "",
              title: "",
              id: "3a7139bd-ab4c-4c2e-bf0d-4e0ff6903e19",
              "image-s3-key":
                "ace/2020-04/7cebf55c-27c1-4e73-839f-85d1399a354e/e69c7b29e024420d95e519b96edfc7aa_18.jpg",
              metadata: {},
              subtype: null,
              hyperlink: "https://www.google.com/"
            },
            {
              description: "",
              "image-metadata": {
                "original-url":
                  "https://media.khou.com/assets/KHOU/images/55ceb4cc-e4a7-4a99-bc29-34ed175c4df2/55ceb4cc-e4a7-4a99-bc29-34ed175c4df2_1140x641.jpg"
              },
              type: "image",
              "family-id": "69f2fa84-f55b-4176-a48e-9cc0521b610d",
              "image-attribution": "",
              title: "",
              id: "5b1501e0-9a91-4720-8660-531511bded39",
              "image-s3-key":
                "ace/2020-04/167805cc-a440-41fe-bccf-132660d4350f/55ceb4cc_e4a7_4a99_bc29_34ed175c4df2_1140x641.jpg",
              metadata: {},
              subtype: null,
              hyperlink: "https://www.google.com/"
            }
          ],
          title: "",
          id: "b35ef956-35ce-4431-a68d-018760a4ddda",
          metadata: {
            type: "gallery"
          },
          subtype: "image-gallery"
        }
      ],
      "card-updated-at": 1587559563683,
      "content-version-id": "11beb6bf-bcb3-4ea2-8764-7355fc40811b",
      "card-added-at": 1524115986932,
      status: "draft",
      id: "954331a6-4e5e-4d96-8204-74f56ce1f837",
      "content-id": "954331a6-4e5e-4d96-8204-74f56ce1f837",
      version: 32,
      metadata: {
        "social-share": {
          shareable: false,
          title: "Ready Player One review – Spielberg ",
          message: "Ready Player One review – Spielberg spins a dizzying VR yarn",
          image: {
            key: "ace/2019-08/e3103795-ebb4-4c6c-93f0-2e829037e008/ready_player_one_hd_wallpapers_70749_6537851.png",
            url: null,
            attribution: null,
            caption: null,
            metadata: {
              width: 1920,
              height: 1080,
              "mime-type": "image/png",
              "file-size": 587085,
              "file-name": "ready-player-one-hd-wallpapers-70749-6537851.png",
              "focus-point": [883, 411]
            }
          }
        },
        attributes: {}
      }
    },
    {
      "story-elements": [
        {
          description: "",
          "page-url": "/story/a3561065-11ce-4281-9d86-325934aa2146/element/d42210d4-4c37-475c-ac6e-414821ad2e57",
          type: "youtube-video",
          "family-id": "43f1bf4c-2144-4f86-b36e-d910ff76eb8d",
          title: "",
          id: "d42210d4-4c37-475c-ac6e-414821ad2e57",
          url: "https://www.youtube.com/watch?v=cSp1dM2Vj48&feature=youtu.be",
          "embed-url": "https://www.youtube.com/embed/cSp1dM2Vj48",
          metadata: {},
          subtype: null
        },
        {
          id: "00000000-0000-0000-0000-000000000000",
          description: "",
          title: "",
          subtype: null,
          type: "text",
          text:
            '<p><a href="https://www.theguardian.com/technology/virtual-reality">Virtual reality</a> is the air guitar solo of modern cinema: a frenetic imagined activity in a made-up world that exists one level below the already made-up world of the story. <a href="https://www.theguardian.com/film/stevenspielberg">Steven Spielberg</a> 2019s <a href="https://www.theguardian.com/film/ready-player-one">Ready Player One</a>.</p>',
          metadata: {
            "promotional-message": true
          }
        }
      ],
      "card-updated-at": 1524116209278,
      "content-version-id": "f1e7f3ea-21f2-4801-b6d7-2022ee079478",
      "card-added-at": 1524116147733,
      status: "draft",
      id: "464e6388-3a0d-49ca-aea7-bce0893259ba",
      "content-id": "464e6388-3a0d-49ca-aea7-bce0893259ba",
      version: 3,
      metadata: {
        "social-share": {
          shareable: false,
          title: "Ready Player One review – Spielberg ",
          message: "Ready Player One review – Spielberg spins a dizzying VR yarn",
          image: {
            key: "ace/2019-08/e3103795-ebb4-4c6c-93f0-2e829037e008/ready_player_one_hd_wallpapers_70749_6537851.png",
            url: null,
            attribution: null,
            caption: null,
            metadata: {
              width: 1920,
              height: 1080,
              "mime-type": "image/png",
              "file-size": 587085,
              "file-name": "ready-player-one-hd-wallpapers-70749-6537851.png",
              "focus-point": [883, 411]
            }
          }
        }
      }
    }
  ],
  url:
    "https://ace-web.qtstage.io/anything/recent-stories/news/ready-player-one-review-spielberg-spins-a-dizzying-vr-yarn",
  "story-version-id": "28c7b47d-3b37-49f6-a0ba-2886d14182e4",
  "content-type": "story",
  "content-updated-at": 1564650017530,
  "author-id": 123981,
  "owner-id": 123981,
  "linked-story-ids": [],
  "promotional-message": '<p>text <a href="https://ace-web.qtstage.io/">promotional</a> message</p>',
  "asana-project-id": null,
  "first-published-at": 1671083514919,
  "hero-image-caption": "hero image caption",
  version: 47,
  "story-template": "review",
  "sequence-no": null,
  "created-at": 1564650011136,
  authors: [
    {
      id: 94980,
      name: "Stephen Wertheim",
      social: {
        twitter: {
          url: "https://www.twitter.com/sabqorg",
          handle: "elonmusk"
        }
      },
      slug: "stephen-wertheim",
      "avatar-url": "https://thumbor-stg.assettype.com/ace/2019-08/145ab200-429f-44ac-8618-00c6e4643e31/cat.jpeg",
      "avatar-s3-key": "ace/2019-08/145ab200-429f-44ac-8618-00c6e4643e31/cat.jpeg",
      "twitter-handle": null,
      bio: null,
      "contributor-role": {
        id: 873,
        name: "Author"
      }
    },
    {
      id: 123981,
      name: "Ravigopal Kesari",
      slug: "ravigopal-kesari",
      social: {
        twitter: {
          url: "https://www.twitter.com/sabqorg",
          handle: "elonmusk"
        }
      },
      "avatar-url":
        "https://lh5.googleusercontent.com/-NhNrHEp1w4M/AAAAAAAAAAI/AAAAAAAAAAs/lzYwVY1BQdQ/photo.jpg?sz=50",
      "avatar-s3-key": null,
      "twitter-handle": null,
      bio: null,
      "contributor-role": {
        id: 873,
        name: "Author"
      }
    },

    {
      id: 949805,
      name: "Harry Potter",
      social: {
        twitter: {
          url: "https://www.twitter.com/sabqorg",
          handle: "elonmusk"
        }
      },
      slug: "stephen-wertheim",
      "avatar-url": "https://thumbor-stg.assettype.com/ace/2019-08/145ab200-429f-44ac-8618-00c6e4643e31/cat.jpeg",
      "avatar-s3-key": "ace/2019-08/145ab200-429f-44ac-8618-00c6e4643e31/cat.jpeg",
      "twitter-handle": null,
      bio: null,
      "contributor-role": {
        id: 879,
        name: "Guest Author"
      }
    },
    {
      id: 949806,
      name: "Hagrid",
      social: {
        twitter: {
          url: "https://www.twitter.com/sabqorg",
          handle: "elonmusk"
        }
      },
      slug: "stephen-wertheim",
      "avatar-url": "https://thumbor-stg.assettype.com/ace/2019-08/145ab200-429f-44ac-8618-00c6e4643e31/cat.jpeg",
      "avatar-s3-key": "ace/2019-08/145ab200-429f-44ac-8618-00c6e4643e31/cat.jpeg",
      "twitter-handle": null,
      bio: null,
      "contributor-role": {
        id: 8708,
        name: "Guest Author"
      }
    }
  ],
  metadata: {
    "review-title": "Ready Player One",
    "review-rating": {
      label: "1",
      value: "1"
    },
    "sponsored-by": "quint",
    "card-share": {
      shareable: false
    }
  },
  "publish-at": null,
  "assignee-name": "Ravigopal Kesari"
};

export const dummyPhotoStory = {
  access: "subscription",
  "updated-at": 1599115419318,
  seo: {
    "claim-reviews": {
      story: null
    }
  },
  "assignee-id": 187245,
  "author-name": "Shreya Shukla",
  "hero-image-hyperlink": "https://www.google.com",
  tags: [
    {
      id: 274973,
      name: "50th Anniversary",
      "meta-description": "5th Anniversary of quintype",
      "meta-title": "5th Anniversary of qt",
      slug: "50th-anniversary",
      "tag-type": "Tag"
    },
    {
      id: 1092771,
      name: "Newzealand",
      "meta-description": null,
      "meta-title": null,
      slug: "newzealand",
      "tag-type": "Tag"
    },
    {
      id: 1292529,
      name: "50",
      "meta-description": null,
      "meta-title": null,
      slug: "50",
      "tag-type": "Tag"
    },
    {
      id: 1292530,
      name: "bangalore",
      "meta-description": null,
      "meta-title": null,
      slug: "bangalore",
      "tag-type": "Tag"
    }
  ],
  customSlotAfterStory: {
    config: { targetingId: "" },
    layout: "Leaderboard",
    layoutLabel: "Leaderboard",
    type: "ad"
  },
  headline: "Karnataka tourism",
  "storyline-id": null,
  votes: {},
  "story-content-id": "231f55c0-ba92-4da6-a2c0-697c520f860f",
  slug: "child-sec/2020/09/02/karnataka-tourism",
  "last-published-at": 1599115422319,
  subheadline: "At vero eos et accusamus iusto odio dignissimos ducimus qui blanditiis pre.",
  alternative: {},
  sections: [
    {
      "domain-slug": null,
      slug: "child-sec",
      name: "child-sec",
      "section-url": "https://ace-web.qtstage.io/parent-sec/child-sec",
      id: 11825,
      "parent-id": 11824,
      "display-name": "child-sec",
      collection: {
        slug: "child-sec-parent-sec",
        name: "child-sec (parent-sec)",
        id: 17115
      },
      data: null
    }
  ],
  "story-audio": {
    "s3-key": "ace/story-audio/2020-09/231f55c0-ba92-4da6-a2c0-697c520f860f/.0fc573c1-97de-4644-8a26-bf65c4d6f0d9.mp3"
  },
  "read-time": 2,
  "access-level-value": null,
  "content-created-at": 1599069527074,
  "owner-name": "Shreya Shukla",
  "custom-slug": null,
  "push-notification": null,
  "publisher-id": 97,
  "hero-image-metadata": {
    "original-url": "https://www.india.com/wp-content/uploads/2014/09/vikasa-soudha-245043_960_720.jpg",
    width: 625,
    height: 470
  },
  comments: null,
  "word-count": 245,
  entities: {},
  "published-at": 1599115422319,
  "is-live-blog": false,
  "breaking-news-linked-story-id": null,
  "storyline-title": null,
  summary: null,
  "push-notification-title": null,
  "external-id": null,
  "canonical-url": null,
  "is-amp-supported": false,
  autotags: [],
  "linked-entities": [],
  status: "published",
  "hero-image-attribution": "Credits: Quintype",
  "bullet-type": "123",
  id: "231f55c0-ba92-4da6-a2c0-697c520f860f",
  "hero-image-s3-key": "ace/2020-06/58fb1855-a741-4b69-9c9b-57eafe34ff04/vikasa_soudha_245043_960_720.jpg",
  contributors: [],
  "associated-series-collection-ids": [],
  cards: [
    {
      "story-elements": [
        {
          description: "",
          "page-url": "/story/191d390f-7f10-422a-86b5-cf589a0bac08/element/d31da4d6-2738-48c6-8a9c-bd1a6ca919ba",
          type: "text",
          "family-id": "4e2d8d24-581a-4204-a40a-f8ab46d62c04",
          title: "",
          id: "d31da4d6-2738-48c6-8a9c-bd1a6ca919ba",
          metadata: {},
          subtype: "summary",
          text:
            '<p>Summary: In 2005, <em><a href="https://en.wikipedia.org/wiki/Nature_(journal)">Nature</a></em> published a peer review comparing 42 <a href="https://en.wikipedia.org/wiki/Hard_science">hard science</a> articles from <em><a href="https://en.wikipedia.org/wiki/Encyclop%C3%A6dia_Britannica">Encyclopædia Britannica</a></em> and Wikipedia and found that Wikipedia\'s level of accuracy approached that of <em>Britannica</em>,<sup><a href="https://en.wikipedia.org/wiki/Wikipedia#cite_note-GilesJ2005Internet-23">[21]</a></sup> although critics suggested that it might not have fared so well in a similar study of a <a href="https://en.wikipedia.org/wiki/Random_sampling">random sampling</a> of all articles or one focused on social science or contentious social issues.<sup><a href="https://en.wikipedia.org/wiki/Wikipedia#cite_note-Reagle,_pp._165%E2%80%93166-24">[22]</a><a href="https://en.wikipedia.org/wiki/Wikipedia#cite_note-Orlowski2005-25">[23]</a></sup> The following year, <em><a href="https://en.wikipedia.org/wiki/Time_(magazine)">Time</a></em> magazine stated that the open-door policy of allowing anyone to edit had made Wikipedia the biggest and possibly the best encyclopedia in the world, and was a testament to the vision of Jimmy Wales.<sup><a href="https://en.wikipedia.org/wiki/Wikipedia#cite_note-26">[24]</a></sup></p>'
        },
        {
          description: "",
          "image-metadata": {
            width: 1920,
            height: 1080,
            "focus-point": [964, 507]
          },
          "page-url": "/story/231f55c0-ba92-4da6-a2c0-697c520f860f/element/7798674b-46f4-429c-95ce-cb5d334277e4",
          type: "image",
          "family-id": "968c8fc8-874e-4982-8eca-9ac5c6ee93aa",
          "image-attribution": "Supreme Court Justice Clarence Thomas in 2007. ",
          title: "nature",
          id: "7798674b-46f4-429c-95ce-cb5d334277e4",
          "image-s3-key": "ace/2018-12/fcdb3782-886c-47ce-a84f-0ef5e051d639/Images_9.jpg",
          metadata: {},
          subtype: null,
          hyperlink: "https://www.google.com/"
        },
        {
          description: "",
          "page-url": "/story/231f55c0-ba92-4da6-a2c0-697c520f860f/element/664c9d54-f0c2-4016-a80e-7c7ed1d64330",
          type: "title",
          "family-id": "d1941b1b-1b4f-4d35-8d2d-6d5c12fabc25",
          title: "",
          id: "664c9d54-f0c2-4016-a80e-7c7ed1d64330",
          metadata: {},
          subtype: null,
          text: "Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus"
        },
        {
          description: "",
          "page-url": "/story/231f55c0-ba92-4da6-a2c0-697c520f860f/element/3bd855a8-9db1-404b-b193-6b4ec7a4c6f2",
          type: "text",
          "family-id": "7994eec8-b28a-47ee-b954-e652d7b829ad",
          title: "",
          id: "3bd855a8-9db1-404b-b193-6b4ec7a4c6f2",
          metadata: {},
          subtype: null,
          text:
            "<p>Dolor sit amet lorem ipsum, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>"
        },
        {
          config: { targetingId: "" },
          layout: "Leaderboard",
          layoutLabel: "Leaderboard",
          type: "ad"
        }
      ],
      "card-updated-at": 1599070341951,
      "content-version-id": "7160cfea-8a20-48a6-a67c-c5c1bf26a062",
      "card-added-at": 1599069777782,
      status: "draft",
      id: "aaf2ca9d-af7d-4c26-9caf-a16f1e104c21",
      "content-id": "aaf2ca9d-af7d-4c26-9caf-a16f1e104c21",
      version: 11,
      metadata: {
        "social-share": {
          shareable: false,
          title: "Karnataka tourism",
          message: null,
          image: {
            key: "ace/2018-12/fcdb3782-886c-47ce-a84f-0ef5e051d639/Images_9.jpg",
            url: null,
            attribution: "Supreme Court Justice Clarence Thomas in 2007. ",
            caption: null,
            metadata: {
              width: 1920,
              height: 1080,
              "focus-point": [964, 507]
            }
          }
        },
        attributes: {}
      }
    },
    {
      "story-elements": [
        {
          description: "",
          "image-metadata": {
            "original-url":
              "https://s.rfi.fr/media/display/ddb13a2c-e9b1-11ea-9cf1-005056bf87d6/w:1280/p:16x9/f4da51e521694ef3b14820c2fd32709e691f058e.jpg",
            width: 1280,
            height: 720
          },
          "page-url": "/story/231f55c0-ba92-4da6-a2c0-697c520f860f/element/d33f9a51-4bc6-4205-8784-86cb11027115",
          type: "image",
          "family-id": "f7ff58e5-dbba-485c-bbcf-9119a764afd5",
          "image-attribution": "Credits: Quintype",
          title: "Supreme Court Justice Clarence Thomas in 2007. ",
          id: "d33f9a51-4bc6-4205-8784-86cb11027115",
          "image-s3-key":
            "ace/2020-08/04562266-d044-4cf3-8ff3-58ab0b084d33/f4da51e521694ef3b14820c2fd32709e691f058e.jpg",
          metadata: {},
          subtype: null,
          hyperlink: "https://www.google.com/"
        },
        {
          description: "",
          "page-url": "/story/231f55c0-ba92-4da6-a2c0-697c520f860f/element/530154d6-f1eb-4e12-8c87-6a49e8269cc6",
          type: "text",
          "family-id": "34bccdf3-115a-4179-b76e-e38742093c03",
          title: "",
          id: "530154d6-f1eb-4e12-8c87-6a49e8269cc6",
          metadata: {},
          subtype: "summary",
          text:
            "<p>Dolor sit amet lorem ipsum, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>"
        },
        {
          description: "",
          "page-url": "/story/231f55c0-ba92-4da6-a2c0-697c520f860f/element/19d75234-ba0a-47d1-b9d3-b79c936b5802",
          type: "text",
          "family-id": "25db509b-047b-44ae-adc4-608037504f9f",
          title: "",
          id: "19d75234-ba0a-47d1-b9d3-b79c936b5802",
          metadata: {
            content:
              "Dolor sit amet lorem ipsum, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
            attribution: "Quintype"
          },
          subtype: "quote",
          text:
            '<div><blockquote>Dolor sit amet lorem ipsum, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</blockquote><span class="attribution">Quintype</span></div>'
        },
        {
          description: "",
          "page-url": "/story/231f55c0-ba92-4da6-a2c0-697c520f860f/element/624c8857-5f74-4494-a494-f9b6345e90d1",
          type: "text",
          "family-id": "518c37ee-41e7-4a33-b7ba-e22f8bdebf02",
          title: "",
          id: "624c8857-5f74-4494-a494-f9b6345e90d1",
          metadata: {
            content:
              "Dolor sit amet lorem ipsum, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
            attribution: "Quintype"
          },
          subtype: "blockquote",
          text:
            '<div><blockquote>Dolor sit amet lorem ipsum, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</blockquote><span class="attribution">Quintype</span></div>'
        },
        {
          description: "",
          "page-url": "/story/231f55c0-ba92-4da6-a2c0-697c520f860f/element/8b61bb6b-695b-4022-aa41-ecfa42aa3b06",
          type: "file",
          "family-id": "debea3c3-2737-4e90-ae7a-a33ef3bbdc83",
          title: "",
          id: "8b61bb6b-695b-4022-aa41-ecfa42aa3b06",
          "file-name": "Doker.pdf",
          url: "https://thumbor-stg.assettype.com/ace/2020-09/d33ccb5b-a3c4-4376-8767-bedebe3e6f7c/Doker.pdf",
          "s3-key": "ace/2020-09/d33ccb5b-a3c4-4376-8767-bedebe3e6f7c/Doker.pdf",
          "content-type": "application/pdf",
          metadata: {
            "file-size": 28746
          },
          subtype: "attachment"
        },
        {
          description: "",
          "page-url": "/story/231f55c0-ba92-4da6-a2c0-697c520f860f/element/85b7b83e-d1ac-4775-8c3c-5c48107db183",
          type: "text",
          "family-id": "4dcb50c4-19da-4d2d-830c-110e01dd0b24",
          title: "",
          id: "85b7b83e-d1ac-4775-8c3c-5c48107db183",
          metadata: {
            question: "<p>Grand Central Terminal, Park Avenue, New York is the world's</p>",
            answer: "<p>largest railway station</p>"
          },
          subtype: "q-and-a",
          text:
            '<div><div class="question"><p>Grand Central Terminal, Park Avenue, New York is the world\'s</p></div><div class="answer"><p>largest railway station</p></div></div>'
        },
        {
          description: "",
          "page-url": "/story/231f55c0-ba92-4da6-a2c0-697c520f860f/element/bb010ef2-8e67-4b72-8d4a-a525c7c4818c",
          type: "text",
          "family-id": "278b4f10-60de-483c-9035-4f9826bcad4c",
          title: "",
          id: "bb010ef2-8e67-4b72-8d4a-a525c7c4818c",
          metadata: {
            question: "<p>For which of the following disciplines is Nobel Prize awarded?</p>",
            answer: "<p>Physics and Chemistry</p><p>Physiology or Medicine</p><p>Literature, Peace and Economics</p>"
          },
          subtype: "q-and-a",
          text:
            '<div><div class="question"><p>For which of the following disciplines is Nobel Prize awarded?</p></div><div class="answer"><p>Physics and Chemistry</p><p>Physiology or Medicine</p><p>Literature, Peace and Economics</p></div></div>'
        }
      ],
      "card-updated-at": 1599070341951,
      "content-version-id": "4a3303f2-250d-4e57-9411-4e6b6ff30cd3",
      "card-added-at": 1599070000242,
      status: "draft",
      id: "d100ec7c-7fed-4cf9-b376-d887371f15e6",
      "content-id": "d100ec7c-7fed-4cf9-b376-d887371f15e6",
      version: 9,
      metadata: {
        "social-share": {
          shareable: false,
          title: "Karnataka tourism",
          message: null,
          image: {
            key: "ace/2020-08/04562266-d044-4cf3-8ff3-58ab0b084d33/f4da51e521694ef3b14820c2fd32709e691f058e.jpg",
            url: null,
            attribution: "Credits: Quintype",
            caption: null,
            metadata: {
              "original-url":
                "https://s.rfi.fr/media/display/ddb13a2c-e9b1-11ea-9cf1-005056bf87d6/w:1280/p:16x9/f4da51e521694ef3b14820c2fd32709e691f058e.jpg",
              width: 1280,
              height: 720
            }
          }
        },
        attributes: {}
      }
    },
    {
      "story-elements": [
        {
          description: "",
          "page-url": "/story/231f55c0-ba92-4da6-a2c0-697c520f860f/element/a22e71ed-d2e6-442c-b30c-4eaae392241e",
          type: "text",
          "family-id": "d5e20362-1fc4-46a9-9e5f-cfd3f399b0e8",
          title: "",
          id: "a22e71ed-d2e6-442c-b30c-4eaae392241e",
          metadata: {},
          subtype: null,
          text:
            "<p>Dolor sit amet lorem ipsum, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>"
        },
        {
          description: "",
          "image-metadata": {
            "original-url":
              "https://s.rfi.fr/media/display/e21e72c0-ec66-11ea-9857-005056a964fe/w:1280/p:16x9/8bfca0efa60a7b897690bea687d9cb3b991611ff_0.jpg",
            width: 1280,
            height: 720
          },
          "page-url": "/story/231f55c0-ba92-4da6-a2c0-697c520f860f/element/613fcdb4-c551-4deb-be2f-ff50428235ec",
          type: "image",
          "family-id": "587b768d-9169-45c7-be30-98caa96b5c27",
          "image-attribution": "",
          title: "",
          id: "613fcdb4-c551-4deb-be2f-ff50428235ec",
          "image-s3-key":
            "ace/2020-09/12d48d3c-dac1-4b99-b961-a724c92c6cc2/8bfca0efa60a7b897690bea687d9cb3b991611ff_0.jpg",
          metadata: {},
          subtype: null,
          hyperlink: "https://www.google.com/"
        },
        {
          description: "",
          "page-url": "/story/231f55c0-ba92-4da6-a2c0-697c520f860f/element/3f57c4cb-0736-4c89-94a2-3891e6cf1dce",
          type: "text",
          "family-id": "28688b87-0abc-4703-b3be-6ad78de90f72",
          title: "",
          id: "3f57c4cb-0736-4c89-94a2-3891e6cf1dce",
          metadata: {},
          subtype: "summary",
          text:
            "<p>Dolor sit amet lorem ipsum, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>"
        },
        {
          id: "00000000-0000-0000-0000-000000000000",
          description: "",
          title: "",
          subtype: null,
          type: "text",
          text: ' <p>text <a href="https://ace-web.qtstage.io/">promotional</a> message</p>',
          metadata: {
            "promotional-message": true
          }
        }
      ],
      "card-updated-at": 1599072759773,
      "content-version-id": "d92aae5f-7d65-4260-853f-c440373905c4",
      "card-added-at": 1599072125631,
      status: "draft",
      id: "92cea38b-f39a-4e1d-b510-9342cc6e792d",
      "content-id": "92cea38b-f39a-4e1d-b510-9342cc6e792d",
      version: 2,
      metadata: {
        "social-share": {
          shareable: false,
          title: "Karnataka tourism",
          message: null,
          image: {
            key: "ace/2020-09/12d48d3c-dac1-4b99-b961-a724c92c6cc2/8bfca0efa60a7b897690bea687d9cb3b991611ff_0.jpg",
            url: null,
            attribution: "",
            caption: null,
            metadata: {
              "original-url":
                "https://s.rfi.fr/media/display/e21e72c0-ec66-11ea-9857-005056a964fe/w:1280/p:16x9/8bfca0efa60a7b897690bea687d9cb3b991611ff_0.jpg",
              width: 1280,
              height: 720
            }
          }
        },
        attributes: {}
      }
    }
  ],
  url: "https://ace-web.qtstage.io/child-sec/2020/09/02/karnataka-tourism",
  "story-version-id": "fb04a248-7855-484c-ab2f-9b71e45fe7e7",
  "content-type": "story",
  "content-updated-at": 1599115422655,
  "author-id": 187245,
  "owner-id": 187245,
  "linked-story-ids": [],
  "promotional-message": ' <p>text <a href="https://ace-web.qtstage.io/">promotional</a> message</p>',
  "asana-project-id": null,
  "first-published-at": 1671083514919,
  "hero-image-caption": "Supreme Court Justice Clarence Thomas in 2007. ",
  version: 19,
  "story-template": "photo",
  "sequence-no": null,
  "created-at": 1599115401203,
  authors: [
    {
      slug: "shreya-shukla-2",
      social: {
        twitter: {
          handle: "shuklashreya801"
        }
      },
      name: "Shreya Shukla",
      "contributor-role": {
        id: 873,
        name: "Author"
      },
      "avatar-url":
        "https://lh6.googleusercontent.com/-pBdJGAfN81c/AAAAAAAAAAI/AAAAAAAAAAA/ACHi3rfmrjS-gWdYzH3Gtmuib3KbVLdixw/photo.jpg",
      bio:
        "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi ",
      id: 187245,
      "avatar-s3-key": null,
      "twitter-handle": "shuklashreya801"
    }
  ],
  metadata: {
    "card-share": {
      shareable: false
    }
  },
  "publish-at": null,
  "assignee-name": "Shreya Shukla"
};

export const dummyLiveBlogStory = {
  access: "subscription",
  "updated-at": 1601277247375,
  seo: { "meta-keywords": [], "claim-reviews": { story: null } },
  "assignee-id": 425675,
  "author-name": "Bindiya H",
  "hero-image-hyperlink": "https://www.google.com",
  tags: [
    {
      id: 163463,
      name: "entertainment",
      "meta-description": null,
      "meta-title": null,
      slug: "entertainment",
      "tag-type": "Tag"
    },
    {
      id: 1209598,
      name: "government",
      "meta-description": null,
      "meta-title": null,
      slug: "government",
      "tag-type": "Tag"
    },
    { id: 1409326, name: "liveblog", "meta-description": null, "meta-title": null, slug: "liveblog", "tag-type": "Tag" }
  ],
  customSlotAfterStory: {
    config: { targetingId: "" },
    layout: "Leaderboard",
    layoutLabel: "Leaderboard",
    type: "ad"
  },
  headline: "Live blog story ",
  "storyline-id": null,
  votes: {},
  "story-content-id": "4270e6db-f238-46d4-8b6d-788ede41760e",
  slug: "entertainment/2020/09/28/live-blog-story-3",
  "last-published-at": 1601277247484,
  subheadline: "At vero eos et accusamus iusto odio dignissimos ducimus qui blanditiis pre.",
  alternative: {},
  sections: [
    {
      "domain-slug": null,
      slug: "entertainment",
      name: "Entertainment",
      "section-url": "https://ace-web.qtstage.io/news/entertainment",
      id: 6447,
      "parent-id": 38586,
      "display-name": "Entertainment",
      collection: { slug: "entertainment", name: "Entertainment", id: 3946 },
      data: null
    }
  ],
  "story-audio": { "s3-key": null },
  "read-time": 0,
  "access-level-value": null,
  "content-created-at": 1601276754377,
  "owner-name": "Bindiya H",
  "custom-slug": null,
  "push-notification": null,
  "publisher-id": 97,
  "hero-image-metadata": { "mime-type": "image/jpeg", "focus-point": [975, 375], width: 1682, height: 820 },
  comments: null,
  "word-count": 0,
  entities: {},
  "published-at": 1601277247484,
  "is-live-blog": true,
  "breaking-news-linked-story-id": null,
  "storyline-title": null,
  summary: null,
  "push-notification-title": null,
  "external-id": null,
  "canonical-url": null,
  "is-amp-supported": true,
  autotags: [],
  "linked-entities": [],
  status: "published",
  "hero-image-attribution": "Google",
  "bullet-type": "123",
  id: "4270e6db-f238-46d4-8b6d-788ede41760e",
  "hero-image-s3-key": "ace/2019-03/f25cc9c1-917c-4a19-9c9a-fa498f84f17b/test.jpg",
  contributors: [],
  "associated-series-collection-ids": [],
  cards: [
    {
      "story-elements": [
        {
          description: "",
          "page-url": "/story/4270e6db-f238-46d4-8b6d-788ede41760e/element/3a569347-2bed-4763-bf3b-b58df01ad6cc",
          type: "title",
          "family-id": "844074a7-2b25-423a-b3c8-88461db91a26",
          title: "",
          id: "3a569347-2bed-4763-bf3b-b58df01ad6cc",
          metadata: {},
          subtype: null,
          text: "Sed ut perspiciatis unde omnis iste natus error"
        },
        {
          description: "",
          "page-url": "/story/4270e6db-f238-46d4-8b6d-788ede41760e/element/739cf8a1-26d8-48fb-8cbf-771b1161ed68",
          type: "text",
          "family-id": "6b3e107b-02d4-4d72-b523-64bbf809246b",
          title: "",
          id: "739cf8a1-26d8-48fb-8cbf-771b1161ed68",
          metadata: {},
          subtype: null,
          text:
            "<p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est</p>"
        }
      ],
      "card-updated-at": 1601431229891,
      "content-version-id": "254fdb13-fa12-426f-a50b-8846847158a5",
      "card-added-at": 1601431063377,
      status: "draft",
      id: "5c8900ed-4676-45f4-a7b6-aa28746370fc",
      "content-id": "5c8900ed-4676-45f4-a7b6-aa28746370fc",
      version: 2,
      metadata: {
        "social-share": {
          shareable: false,
          title: "Live Updates",
          message: null,
          image: {
            key: "ace/2019-03/f25cc9c1-917c-4a19-9c9a-fa498f84f17b/test.jpg",
            url: "https://thumbor-stg.assettype.com/ace/2019-03/f25cc9c1-917c-4a19-9c9a-fa498f84f17b/test.jpg",
            attribution: "Google",
            caption: "Saque ipsa quae ab illo inventore veritatis et quip",
            metadata: { "mime-type": "image/jpeg", "focus-point": [975, 375], width: 1682, height: 820 }
          }
        },
        attributes: {}
      }
    },
    {
      "story-elements": [
        {
          description: "",
          "page-url": "/story/4270e6db-f238-46d4-8b6d-788ede41760e/element/8ee1c6ed-57d8-4891-8a77-e789b2d33c29",
          type: "title",
          "family-id": "fab4dbe9-acce-43cb-8d3e-3b7d83afe04a",
          title: "",
          id: "8ee1c6ed-57d8-4891-8a77-e789b2d33c29",
          metadata: {},
          subtype: null,
          text: "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium"
        },
        {
          description: "",
          "page-url": "/story/4270e6db-f238-46d4-8b6d-788ede41760e/element/78142993-d358-4c17-b610-9c80101f32b1",
          type: "text",
          "family-id": "ec1e356a-d274-4f71-9ef9-4f070c907894",
          title: "",
          id: "78142993-d358-4c17-b610-9c80101f32b1",
          metadata: {},
          subtype: null,
          text:
            "<p>Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem.</p>"
        },
        {
          description: "",
          "image-url":
            "https://thumbor-stg.assettype.com/ace/2020-09/55df83b2-3181-49f3-b1d9-31cc91dda1be/3aae2ba50b3667e9f02e3674a37581fae1ebaf74_3.jpg",
          "member-id": 934395,
          "image-metadata": {
            "original-url":
              "https://s.rfi.fr/media/display/a1b6b938-01c2-11eb-ba87-005056a964fe/w:1280/p:16x9/3aae2ba50b3667e9f02e3674a37581fae1ebaf74_3.jpg",
            width: 1280,
            height: 720
          },
          "uploaded-at": 1601327722596,
          "page-url": "/story/4270e6db-f238-46d4-8b6d-788ede41760e/element/bf739a18-6878-485a-adc7-d608d767f123",
          type: "image",
          "family-id": "98f289da-3a92-48e0-ac66-2c0381b9fbc8",
          "image-attribution": "",
          title: "Premier League",
          id: "bf739a18-6878-485a-adc7-d608d767f123",
          "image-s3-key":
            "ace/2020-09/55df83b2-3181-49f3-b1d9-31cc91dda1be/3aae2ba50b3667e9f02e3674a37581fae1ebaf74_3.jpg",
          metadata: {},
          subtype: null,
          hyperlink: "https://www.google.com/"
        }
      ],
      "card-updated-at": 1601431229891,
      "content-version-id": "2640b2cd-e57e-47b8-9a09-0c9e61bec4a9",
      "card-added-at": 1601372749401,
      status: "draft",
      id: "42c89975-2f45-472e-ae09-73fec6f020b7",
      "content-id": "42c89975-2f45-472e-ae09-73fec6f020b7",
      version: 3,
      metadata: {
        "social-share": {
          shareable: false,
          title: "Live Updates",
          message: null,
          image: {
            key: "ace/2020-09/55df83b2-3181-49f3-b1d9-31cc91dda1be/3aae2ba50b3667e9f02e3674a37581fae1ebaf74_3.jpg",
            url:
              "https://thumbor-stg.assettype.com/ace/2020-09/55df83b2-3181-49f3-b1d9-31cc91dda1be/3aae2ba50b3667e9f02e3674a37581fae1ebaf74_3.jpg",
            attribution: "",
            caption: null,
            metadata: {
              "original-url":
                "https://s.rfi.fr/media/display/a1b6b938-01c2-11eb-ba87-005056a964fe/w:1280/p:16x9/3aae2ba50b3667e9f02e3674a37581fae1ebaf74_3.jpg",
              width: 1280,
              height: 720
            }
          }
        },
        attributes: {}
      }
    },
    {
      "story-elements": [
        {
          description: "",
          "page-url": "/story/4270e6db-f238-46d4-8b6d-788ede41760e/element/1cef89d6-c934-4f3c-b4d1-56460eb076e4",
          type: "title",
          "family-id": "f73118f0-74b8-4b9f-b2f6-c3b26852e110",
          title: "",
          id: "1cef89d6-c934-4f3c-b4d1-56460eb076e4",
          metadata: {},
          subtype: null,
          text: "Sed ut perspiciatis unde omnis iste natus error "
        }
      ],
      "card-updated-at": 1601431229891,
      "content-version-id": "89935f86-dba4-4f90-b7ea-f59db58554f7",
      "card-added-at": 1601289122939,
      status: "draft",
      id: "69fb8bd4-77e8-4b17-bca4-c229b92ce57f",
      "content-id": "69fb8bd4-77e8-4b17-bca4-c229b92ce57f",
      version: 6,
      metadata: {
        "social-share": {
          shareable: false,
          title: "Live Updates",
          message: null,
          image: {
            key: "ace/2019-03/f25cc9c1-917c-4a19-9c9a-fa498f84f17b/test.jpg",
            url: "https://thumbor-stg.assettype.com/ace/2019-03/f25cc9c1-917c-4a19-9c9a-fa498f84f17b/test.jpg",
            attribution: "Google",
            caption: "Saque ipsa quae ab illo inventore veritatis et quip",
            metadata: { "mime-type": "image/jpeg", "focus-point": [975, 375], width: 1682, height: 820 }
          }
        },
        attributes: { "key-event": true }
      }
    },
    {
      "story-elements": [
        {
          description: "",
          "page-url": "/story/4270e6db-f238-46d4-8b6d-788ede41760e/element/1cef89d6-c934-4f3c-b4d1-56460eb076e4",
          type: "title",
          "family-id": "f73118f0-74b8-4b9f-b2f6-c3b26852e110",
          title: "",
          id: "1cef89d6-c934-4f3c-b4d1-56460eb076e4",
          metadata: {},
          subtype: null,
          text: "Sed ut perspiciatis unde omnis iste natus error "
        }
      ],
      "card-updated-at": 1601431229891,
      "content-version-id": "89935f86-dba4-4f90-b7ea-f59db58554f7",
      "card-added-at": 1601289122939,
      status: "draft",
      id: "69fb8bd4-77e8-4b17-bca4-c229b92ce57f",
      "content-id": "69fb8bd4-77e8-4b17-bca4-c229b92ce57f",
      version: 6,
      metadata: {
        "social-share": {
          shareable: false,
          title: "Live Updates",
          message: null,
          image: {
            key: "ace/2019-03/f25cc9c1-917c-4a19-9c9a-fa498f84f17b/test.jpg",
            url: "https://thumbor-stg.assettype.com/ace/2019-03/f25cc9c1-917c-4a19-9c9a-fa498f84f17b/test.jpg",
            attribution: "Google",
            caption: "Saque ipsa quae ab illo inventore veritatis et quip",
            metadata: { "mime-type": "image/jpeg", "focus-point": [975, 375], width: 1682, height: 820 }
          }
        },
        attributes: { "key-event": true }
      }
    },
    {
      "story-elements": [
        {
          description: "",
          "page-url": "/story/4270e6db-f238-46d4-8b6d-788ede41760e/element/1cef89d6-c934-4f3c-b4d1-56460eb076e4",
          type: "title",
          "family-id": "f73118f0-74b8-4b9f-b2f6-c3b26852e110",
          title: "",
          id: "1cef89d6-c934-4f3c-b4d1-56460eb076e4",
          metadata: {},
          subtype: null,
          text: "Sed ut perspiciatis unde omnis iste natus error "
        }
      ],
      "card-updated-at": 1601431229891,
      "content-version-id": "89935f86-dba4-4f90-b7ea-f59db58554f7",
      "card-added-at": 1601289122939,
      status: "draft",
      id: "69fb8bd4-77e8-4b17-bca4-c229b92ce57f",
      "content-id": "69fb8bd4-77e8-4b17-bca4-c229b92ce57f",
      version: 6,
      metadata: {
        "social-share": {
          shareable: false,
          title: "Live Updates",
          message: null,
          image: {
            key: "ace/2019-03/f25cc9c1-917c-4a19-9c9a-fa498f84f17b/test.jpg",
            url: "https://thumbor-stg.assettype.com/ace/2019-03/f25cc9c1-917c-4a19-9c9a-fa498f84f17b/test.jpg",
            attribution: "Google",
            caption: "Saque ipsa quae ab illo inventore veritatis et quip",
            metadata: { "mime-type": "image/jpeg", "focus-point": [975, 375], width: 1682, height: 820 }
          }
        },
        attributes: { "key-event": true }
      }
    },
    {
      "story-elements": [
        {
          description: "",
          "page-url": "/story/4270e6db-f238-46d4-8b6d-788ede41760e/element/b62c0458-b8eb-4f3d-9f3b-86d04447a909",
          type: "title",
          "family-id": "b716edab-a036-4db6-8ca1-9d119afcac3d",
          title: "",
          id: "b62c0458-b8eb-4f3d-9f3b-86d04447a909",
          metadata: {},
          subtype: null,
          text: "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium"
        }
      ],
      "card-updated-at": 1601277247407,
      "content-version-id": "49686375-3b2c-4f02-93a8-e47d1a063e1f",
      "card-added-at": 1601277247407,
      status: "draft",
      id: "ea05dbab-e2d7-41f2-9055-5287bb659c6f",
      "content-id": "ea05dbab-e2d7-41f2-9055-5287bb659c6f",
      version: 1,
      metadata: {
        "social-share": {
          shareable: false,
          title: "Live Updates",
          message: null,
          image: {
            key: "ace/2019-03/f25cc9c1-917c-4a19-9c9a-fa498f84f17b/test.jpg",
            url: "https://thumbor-stg.assettype.com/ace/2019-03/f25cc9c1-917c-4a19-9c9a-fa498f84f17b/test.jpg",
            attribution: "Google",
            caption: "Saque ipsa quae ab illo inventore veritatis et quip",
            metadata: { "mime-type": "image/jpeg", "focus-point": [975, 375], width: 1682, height: 820 }
          }
        },
        attributes: { "key-event": true }
      }
    },
    {
      "story-elements": [
        {
          description: "",
          "page-url": "/story/4270e6db-f238-46d4-8b6d-788ede41760e/element/3ca72d69-09d3-47be-8921-a993c111fd9e",
          type: "title",
          "family-id": "6ddbc420-4f89-488e-9332-d16ed4e4c481",
          title: "",
          id: "3ca72d69-09d3-47be-8921-a993c111fd9e",
          metadata: {},
          subtype: null,
          text: "Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus"
        },
        {
          id: "00000000-0000-0000-0000-000000000000",
          description: "",
          title: "",
          subtype: null,
          type: "text",
          text: ' <p>text <a href="https://ace-web.qtstage.io/">promotional</a> message</p>',
          metadata: { "promotional-message": true }
        }
      ],
      "card-updated-at": 1601277247407,
      "content-version-id": "0acfbcb5-c770-498e-8439-a137e031dede",
      "card-added-at": 1601277247407,
      status: "draft",
      id: "e4bf3f6e-cb5f-4a3e-b1cd-965b523da0e3",
      "content-id": "e4bf3f6e-cb5f-4a3e-b1cd-965b523da0e3",
      version: 1,
      metadata: {
        "social-share": {
          shareable: false,
          title: "Live Updates",
          message: null,
          image: {
            key: "ace/2019-03/f25cc9c1-917c-4a19-9c9a-fa498f84f17b/test.jpg",
            url: "https://thumbor-stg.assettype.com/ace/2019-03/f25cc9c1-917c-4a19-9c9a-fa498f84f17b/test.jpg",
            attribution: "Google",
            caption: "Saque ipsa quae ab illo inventore veritatis et quip",
            metadata: { "mime-type": "image/jpeg", "focus-point": [975, 375], width: 1682, height: 820 }
          }
        },
        attributes: { "key-event": true }
      }
    }
  ],
  url: "https://ace-web.qtstage.io/entertainment/2020/09/28/live-blog-story-3",
  "story-version-id": "dbc68251-e21d-4b1f-b8d2-e6ec972249ce",
  "content-type": "story",
  "content-updated-at": 1601431232290,
  "author-id": 425675,
  "owner-id": 425675,
  "linked-story-ids": [],
  "promotional-message": ' <p>text <a href="https://ace-web.qtstage.io/">promotional</a> message</p>',
  "asana-project-id": null,
  "first-published-at": 1671083514919,
  "hero-image-caption": "Saque ipsa quae ab illo inventore veritatis et quip",
  version: 10,
  "story-template": "live-blog",
  "sequence-no": null,
  "created-at": 1601431229862,
  authors: [
    {
      slug: "bindiya-h",
      social: { twitter: { handle: "h_bindiya" } },
      name: "Bindiya H",
      "contributor-role": { id: 873, name: "Author" },
      "avatar-url":
        "https://lh6.googleusercontent.com/-T9_sTsD4Qco/AAAAAAAAAAI/AAAAAAAAAAA/ACHi3rc0KarItXiZkh68r6sgS4QwAApcbg/photo.jpg",
      bio: "Biooo ?",
      id: 425675,
      "avatar-s3-key": null,
      "twitter-handle": "h_bindiya"
    },
    {
      slug: "bindiya-h",
      social: { twitter: { handle: "h_bindiya" } },
      name: "Raman V",
      "contributor-role": { id: 873, name: "Guest Author" },
      "avatar-url":
        "https://lh6.googleusercontent.com/-T9_sTsD4Qco/AAAAAAAAAAI/AAAAAAAAAAA/ACHi3rc0KarItXiZkh68r6sgS4QwAApcbg/photo.jpg",
      bio: "Biooo ?",
      id: 425676,
      "avatar-s3-key": null,
      "twitter-handle": "h_bindiya"
    }
  ],
  metadata: { "is-closed": false, "card-share": { shareable: false } },
  "hero-image-url": "https://thumbor-stg.assettype.com/ace/2019-03/f25cc9c1-917c-4a19-9c9a-fa498f84f17b/test.jpg",
  "publish-at": null,
  "assignee-name": "Bindiya H"
};

export const dummyListicleStory = {
  access: "subscription",
  "updated-at": 1602234193104,
  seo: { "claim-reviews": { story: null } },
  "assignee-id": 927927,
  "author-name": "Pravin Atigre",
  "hero-image-hyperlink": "https://www.google.com",
  tags: [
    { id: 1421524, name: "health", "meta-description": null, "meta-title": null, slug: "health", "tag-type": "Tag" },
    { id: 1421525, name: "culture", "meta-description": null, "meta-title": null, slug: "culture", "tag-type": "Tag" },
    {
      id: 1421526,
      name: "workplace",
      "meta-description": null,
      "meta-title": null,
      slug: "workplace",
      "tag-type": "Tag"
    }
  ],
  customSlotAfterStory: {
    config: { targetingId: "" },
    layout: "Leaderboard",
    layoutLabel: "Leaderboard",
    type: "ad"
  },
  headline: "It pays to be kind: improving workplace culture through kindness",
  "storyline-id": null,
  votes: {},
  "story-content-id": "307e5a1b-5cf0-4321-8193-827b2add174f",
  slug: "health/2020/10/08/it-pays-to-be-kind-improving-workplace-culture-through-kindness",
  "last-published-at": 1602234199516,
  subheadline: "Neque porro quisquam est, qui dolorem ipsum quia dolor sit.",
  alternative: {},
  sections: [
    {
      "domain-slug": null,
      slug: "health",
      name: "Health",
      "section-url": "https://ace-web.qtstage.io/news/health",
      id: 11181,
      "parent-id": 38586,
      "display-name": "Health",
      collection: { slug: "health", name: "Health", id: 15603 },
      data: null
    }
  ],
  "story-audio": {
    "s3-key": "ace/story-audio/2020-10/307e5a1b-5cf0-4321-8193-827b2add174f/.0e6d9a89-3bb7-47b0-8bee-a34b5f75f5e9.mp3"
  },
  "read-time": 2,
  "access-level-value": null,
  "content-created-at": 1602154991378,
  "owner-name": "Pravin Atigre",
  "custom-slug": null,
  "push-notification": null,
  "publisher-id": 97,
  "hero-image-metadata": {
    width: 1600,
    height: 900,
    "mime-type": "image/jpeg",
    "file-size": 228062,
    "file-name": "seo.jpg"
  },
  comments: null,
  "word-count": 232,
  entities: {},
  "published-at": 1602234199516,
  "is-live-blog": false,
  "breaking-news-linked-story-id": null,
  "storyline-title": null,
  summary: null,
  "push-notification-title": null,
  "external-id": null,
  "canonical-url": null,
  "is-amp-supported": true,
  autotags: [],
  "linked-entities": [],
  status: "published",
  "hero-image-attribution": "Credits: Asif Asharaf",
  "bullet-type": "123",
  id: "307e5a1b-5cf0-4321-8193-827b2add174f",
  "hero-image-s3-key": "ace/2020-10/ec88fad0-ed4d-44ec-9930-72e9d897bdd0/seo.jpg",
  contributors: [],
  "associated-series-collection-ids": [],
  cards: [
    {
      "story-elements": [
        {
          description: "",
          "page-url": "/story/307e5a1b-5cf0-4321-8193-827b2add174f/element/5ffad09b-7db1-489a-8308-f7d63c745c70",
          type: "title",
          "family-id": "d3bf6239-6723-4291-a7d1-6164c808d07d",
          title: "",
          id: "5ffad09b-7db1-489a-8308-f7d63c745c70",
          metadata: {},
          subtype: null,
          text: "Nemo enim ipsam voluptatem quia volup tas sit aspernatur aut odit aut fugit"
        },
        {
          description: "",
          "page-url": "/story/307e5a1b-5cf0-4321-8193-827b2add174f/element/f24c83a4-dd3d-47fe-8d05-90f6ada10632",
          type: "text",
          "family-id": "0a4af70b-2434-4038-8134-87cdc60fc379",
          title: "",
          id: "f24c83a4-dd3d-47fe-8d05-90f6ada10632",
          metadata: {},
          subtype: null,
          text:
            "<p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est</p>"
        }
      ],
      "card-updated-at": 1602234185925,
      "content-version-id": "9378abd6-2cec-4bdd-88b2-005cc6d1775f",
      "card-added-at": 1602155475842,
      status: "draft",
      id: "aeb377da-eb9f-4013-ae19-fb6fb821e926",
      "content-id": "aeb377da-eb9f-4013-ae19-fb6fb821e926",
      version: 9,
      metadata: {
        "social-share": {
          shareable: false,
          title: "It pays to be kind: improving workplace culture through kindness",
          message: null,
          image: {
            key: "ace/2020-10/ec88fad0-ed4d-44ec-9930-72e9d897bdd0/seo.jpg",
            url: null,
            attribution: "Credits: Asif Asharaf",
            caption: "Saque ipsa quae ab illo inventore veritatis et quip",
            metadata: {
              width: 1600,
              height: 900,
              "mime-type": "image/jpeg",
              "file-size": 228062,
              "file-name": "seo.jpg"
            }
          }
        },
        attributes: {}
      }
    },
    {
      "story-elements": [
        {
          description: "",
          "page-url": "/story/307e5a1b-5cf0-4321-8193-827b2add174f/element/82244bcd-c453-41c4-a215-bb038f569375",
          type: "title",
          "family-id": "11f060e0-a1aa-4963-9778-24f6b6eca401",
          title: "",
          id: "82244bcd-c453-41c4-a215-bb038f569375",
          metadata: {},
          subtype: null,
          text: "Nemo enim ipsam voluptatem quia volup tas sit aspernatur aut odit aut fugit"
        },
        {
          description: "",
          "page-url": "/story/307e5a1b-5cf0-4321-8193-827b2add174f/element/ae7131f6-450a-4589-9995-812ba5832c58",
          type: "text",
          "family-id": "a970d458-c7d8-4512-8420-4bf3a4046caf",
          title: "",
          id: "ae7131f6-450a-4589-9995-812ba5832c58",
          metadata: {},
          subtype: null,
          text:
            "<p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est</p>"
        }
      ],
      "card-updated-at": 1602155725655,
      "content-version-id": "43ff8777-4176-4294-95a3-5aaee8e34537",
      "card-added-at": 1602155520864,
      status: "draft",
      id: "70988ea9-90a0-42ea-b2b1-1f7374de06e1",
      "content-id": "70988ea9-90a0-42ea-b2b1-1f7374de06e1",
      version: 7,
      metadata: {
        "social-share": {
          shareable: false,
          title: "It pays to be kind: improving workplace culture through kindness",
          message: null,
          image: {
            key: "ace/2020-10/ec88fad0-ed4d-44ec-9930-72e9d897bdd0/seo.jpg",
            url: null,
            attribution: "Credits: Asif Asharaf",
            caption: "Saque ipsa quae ab illo inventore veritatis et quip",
            metadata: {
              width: 1600,
              height: 900,
              "mime-type": "image/jpeg",
              "file-size": 228062,
              "file-name": "seo.jpg"
            }
          }
        },
        attributes: {}
      }
    },
    {
      "story-elements": [
        {
          description: "",
          "page-url": "/story/307e5a1b-5cf0-4321-8193-827b2add174f/element/d3cbfcce-a503-499d-80cd-52fce2215ef3",
          type: "title",
          "family-id": "1b8bcf8e-19cb-4d16-ac0e-bb4f0939dbbf",
          title: "",
          id: "d3cbfcce-a503-499d-80cd-52fce2215ef3",
          metadata: {},
          subtype: null,
          text: "Nemo enim ipsam voluptatem quia volup tas sit aspernatur aut odit aut fugit"
        },
        {
          description: "",
          "image-metadata": {
            width: 960,
            height: 540,
            "mime-type": "image/jpeg",
            "file-size": 26544,
            "file-name": "quintype-website_2020-01_2f2ba42d-7a45-4a60-b4af-7d4758f27f5d_Untitled_presentation.jpg"
          },
          "page-url": "/story/307e5a1b-5cf0-4321-8193-827b2add174f/element/a7f79ffa-4be0-4207-a495-a035a020cac3",
          type: "image",
          "family-id": "6d5d82b8-f879-476d-84a2-1f62f74acdd5",
          "image-attribution": "Jon Doe",
          title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
          id: "a7f79ffa-4be0-4207-a495-a035a020cac3",
          "image-s3-key":
            "ace/2020-10/920f35b9-023e-44d2-b4de-69dce8587bf7/quintype_website_2020_01_2f2ba42d_7a45_4a60_b4af_7d4758f27f5d_Untitled_presentation.jpg",
          metadata: {},
          subtype: null,
          hyperlink: "https://www.google.com/"
        },
        {
          description: "",
          "page-url": "/story/307e5a1b-5cf0-4321-8193-827b2add174f/element/2a248f86-3181-4456-9f96-f7e56668fbc1",
          type: "text",
          "family-id": "b9a1fdd8-5727-4e5a-86a6-467922aa155f",
          title: "",
          id: "2a248f86-3181-4456-9f96-f7e56668fbc1",
          metadata: {},
          subtype: null,
          text:
            "<p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est</p>"
        }
      ],
      "card-updated-at": 1602156067786,
      "content-version-id": "dbfeb570-f9aa-4875-9c3d-f48bf551dd91",
      "card-added-at": 1602155541845,
      status: "draft",
      id: "d6876a49-9319-4c24-9bf9-881ea454b967",
      "content-id": "d6876a49-9319-4c24-9bf9-881ea454b967",
      version: 10,
      metadata: {
        "social-share": {
          shareable: false,
          title: "It pays to be kind: improving workplace culture through kindness",
          message: null,
          image: {
            key:
              "ace/2020-10/920f35b9-023e-44d2-b4de-69dce8587bf7/quintype_website_2020_01_2f2ba42d_7a45_4a60_b4af_7d4758f27f5d_Untitled_presentation.jpg",
            url: null,
            attribution: "Jon Doe",
            caption: null,
            metadata: {
              width: 960,
              height: 540,
              "mime-type": "image/jpeg",
              "file-size": 26544,
              "file-name": "quintype-website_2020-01_2f2ba42d-7a45-4a60-b4af-7d4758f27f5d_Untitled_presentation.jpg"
            }
          }
        },
        attributes: {}
      }
    },
    {
      "story-elements": [
        {
          description: "",
          "page-url": "/story/307e5a1b-5cf0-4321-8193-827b2add174f/element/20db973e-4612-4933-9acd-5a6d4c3d281d",
          type: "text",
          "family-id": "b8f84eb7-4a91-45ba-a5d3-95d5f48c7772",
          title: "",
          id: "20db973e-4612-4933-9acd-5a6d4c3d281d",
          metadata: {},
          subtype: null,
          text:
            "<p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est</p>"
        },
        {
          id: "00000000-0000-0000-0000-000000000000",
          description: "",
          title: "",
          subtype: null,
          type: "text",
          text: ' <p>text <a href="https://ace-web.qtstage.io/">promotional</a> message</p>',
          metadata: { "promotional-message": true }
        }
      ],
      "card-updated-at": 1602156067786,
      "content-version-id": "dc523cfa-dcf2-41b5-ab7a-b5c3577e11f7",
      "card-added-at": 1602156035607,
      status: "draft",
      id: "539c1ed1-79e5-4771-a304-60b46d8376c6",
      "content-id": "539c1ed1-79e5-4771-a304-60b46d8376c6",
      version: 2,
      metadata: {
        "social-share": {
          shareable: false,
          title: "It pays to be kind: improving workplace culture through kindness",
          message: null,
          image: {
            key: "ace/2020-10/ec88fad0-ed4d-44ec-9930-72e9d897bdd0/seo.jpg",
            url: null,
            attribution: "Credits: Asif Asharaf",
            caption: "Saque ipsa quae ab illo inventore veritatis et quip",
            metadata: {
              width: 1600,
              height: 900,
              "mime-type": "image/jpeg",
              "file-size": 228062,
              "file-name": "seo.jpg"
            }
          }
        },
        attributes: {}
      }
    }
  ],
  url: "https://ace-web.qtstage.io/health/2020/10/08/it-pays-to-be-kind-improving-workplace-culture-through-kindness",
  "story-version-id": "8768d161-6433-4f1e-b8ef-e632d180ede9",
  "content-type": "story",
  "content-updated-at": 1602234199729,
  "author-id": 927927,
  "owner-id": 927927,
  "linked-story-ids": [],
  "promotional-message": ' <p>text <a href="https://ace-web.qtstage.io/">promotional</a> message</p>',
  "asana-project-id": null,
  "first-published-at": 1671083514919,
  "hero-image-caption": "Saque ipsa quae ab illo inventore veritatis et quip",
  version: 18,
  "story-template": "listicle",
  "sequence-no": null,
  "created-at": 1602234185901,
  authors: [
    {
      slug: "pravin-atigre",
      social: null,
      name: "Virat Kohli",
      "contributor-role": { id: 873, name: "Author" },
      "avatar-url":
        "https://lh3.googleusercontent.com/-I9kNTMFkn3E/AAAAAAAAAAI/AAAAAAAAAAA/ACHi3rdZeM4LMMdylmULvtrAvmeVF9DmAQ/photo.jpg",
      bio:
        "Virat Kohli (Hindi pronunciation: [ʋɪˈɾɑːʈ ˈkoːɦli] (listen); born 5 November 1988) is an Indian international cricketer and the former captain of the Indian national cricket team who plays as a right-handed batsman for Royal Challengers Bangalore in the IPL and for Delhi in Indian domestic cricket. Widely regarded as one of the greatest batsmen of all time,[4] Kohli holds the records for scoring most runs in T20 internationals and in the IPL. In 2020, the International Cricket Council named him the male cricketer of the decade. Kohli has also contributed to a number of India's successes, including winning the 2011 World Cup and the 2013 Champions trophy.",
      id: 927927,
      "avatar-s3-key": null,
      "twitter-handle": null
    }
  ],
  metadata: { "card-share": { shareable: false } },
  "publish-at": null,
  "assignee-name": "Pravin Atigre"
};
