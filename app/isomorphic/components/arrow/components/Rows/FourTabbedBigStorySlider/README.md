# FourTabbedBigStorySlider

The _FourTabbedBigStorySlider_ component is a basic [row](https://bradfrost.com/blog/post/atomic-web-design/#organisms) with horizontal scroll to select respective story card.

There are no configurable slots in this row.

## Usage

### Import

```jsx
import { FourTabbedBigStorySlider } from "@quintype/arrow";
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
<FourTabbedBigStorySlider collection={collection} config={contextConfig} />
```

<!-- PROPS -->
