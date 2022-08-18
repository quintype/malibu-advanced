# Two Col Seven Stories

The _TwoColSevenStories_ component is a [row](https://bradfrost.com/blog/post/atomic-web-design/#organisms) with seven StoryCards. The last two cards combined is a configurable slot which can be replaced by an AD.

## Usage

### Import

```jsx
import { TwoColSevenStories } from "@quintype/arrow";
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
<TwoColSevenStories collection={collection} config={contextConfig} />
```

<!-- PROPS -->
