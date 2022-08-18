# Two Col Three Stories


The _TwoColThreeStories_ component is a basic [row](https://bradfrost.com/blog/post/atomic-web-design/#organisms) with three StoryCards.


There are no configurable slots in this row.

## Usage

### Import

```jsx
import { TwoColThreeStories } from "@quintype/arrow"

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
  showFooterButton: true,
  buttonText: "LoadMore",
  showRowTitle: true,
  footerSlotConfig: { footerSlot: () => <CustomFooterComponent /> }
};
```

### Use as a component
```jsx
<TwoColThreeStories collection={collection} config={contextConfig} />
```

<!-- PROPS -->
