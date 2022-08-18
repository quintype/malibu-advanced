# Eleven Stories

The _11 stories_ component is a basic [row](https://bradfrost.com/blog/post/atomic-web-design/#organisms) with storycards.

Last column of the 11 stories row supports collection, ad/widget also.

## Usage

### Import
```jsx
import { ElevenColGrid } from "@quintype/arrow"
```

### Setting the Row context

```jsx
const contextConfig = {
  theme: "#ffffff",
  collectionNameTemplate: "default",
  sectionTagTemplate: "solid",
  showSection: true,
  showRowTitle: true,
  showAuthor: true,
  showTime: true,
  showSubheadline: true,
  withseparator: true,
  showFooterButton: false,
  buttonText: "Load More",
  slotConfig: [{ type: "story" }],
  footerSlotConfig: { footerSlot: () => <CustomFooterComponent /> }
};
```

### Use as a component
```jsx
<ElevenStories collection={collection} config={contextConfig} />
```

<!-- PROPS -->
