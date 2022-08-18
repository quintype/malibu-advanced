# Three Column Six Stories

The _ThreeColTwelveStories_ is component that represents 3 child collections withing parent collection.

Column numbers(2 or 3) can vary as per selection of slot type.

config is the prop which is responsible for handling configuration of 12 stories, 8 stories 2 ad or 8 stories 2 widget row.

### Import

```jsx
import { ThreeColTwelveStories } from "@quintype/arrow";
```

### Setting the Row context

```jsx
const contextConfig = {
  collectionNameBorderColor: "c70000",
  theme: theme: "#ffffff",
  withSeparator: true,
  collectionNameTemplate: "borderLeft",
  showAuthor: true,
  showTime: true,
  footerButton: {
    NavigateToPage: "NavigateToPage"
  },
  buttonText: "Read More",
  showButton: true,
  showReadTime: true,
  slotConfig: [{ type: "story", component: configurableSlot }, { type: "story", component: configurableSlot }]
};
```

### Use as a component

```jsx
<ThreeColTwelveStories collection={collection} config={contextConfig} />
```

<!-- PROPS -->
