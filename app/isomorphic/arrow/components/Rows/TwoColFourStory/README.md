# Two Column Four Stories

The _TwoColFourStories_ component is a basic two column [row](https://bradfrost.com/blog/post/atomic-web-design/#organisms).

### Import
```jsx
import { TwoColFourStories } from "@quintype/arrow"
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
  showRowTitle: true,
  showFooterButton: true,
  buttonText: "Load More",
  footerSlotConfig: { footerSlot: () => <FooterComponent /> }
};
```

### Use as a component
```jsx
<TwoColFourStories collection={collection} config={contextConfig} />
```

<!-- PROPS -->
