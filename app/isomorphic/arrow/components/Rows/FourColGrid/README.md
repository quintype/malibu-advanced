# Four Column Grid

The _FourColGrid_ component is a basic four column storycard [row](https://bradfrost.com/blog/post/atomic-web-design/#organisms).

Last story of the four column grid supports an ad/widget slot.

## Usage

### Import
```jsx
import { FourColGrid } from "@quintype/arrow"
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
  footerSlotConfig: { footerSlot: () => <FooterComponent /> },
  subsequentLoadCount: 8
};
```

### Use as a component
```jsx
<FourColGrid collection={collection} config={contextConfig} />
```

<!-- PROPS -->
