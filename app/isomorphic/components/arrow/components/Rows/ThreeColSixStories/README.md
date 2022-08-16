# Three Column Six Stories

The _ThreeColSixStories_ component is a basic [row](https://bradfrost.com/blog/post/atomic-web-design/#organisms) used to represent a Row with storycards.

The _Row/Organisms_ can be composible based on it's children(Atoms/molecules) or using StoryCardContent component(molecule)

config is the prop which is responsible for handling configuration of 6 stories, 5 stories 1 ad or 5 stories 1 widget row.

second story of the row we can as ad and widget.

### Import
```jsx
import { ThreeColSixStories } from "@quintype/arrow"
```

### Setting the Row context

```jsx
const contextConfig = {
  theme: "#ffffff",
  border: "",
  collectionNameTemplate: "default",
  sectionTagTemplate: "default",
  showSection: true,
  showAuthor: true,
  showTime: true,
  slotConfig: [{ type: "story", component: () => <AdOrWidget /> }],
  showRowTitle: true,
  showFooterButton: true,
  buttonText: "Load More",
  footerSlotConfig: { footerSlot: () => <FooterComponent /> }
};
```

### Use as a component
```jsx
<ThreeColSixStories collection={collection} config={contextConfig} />
```

<!-- PROPS -->
