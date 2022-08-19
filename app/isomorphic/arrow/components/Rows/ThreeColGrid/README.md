# Three Column Grid

The _ThreeColGrid_ component is a basic three column [row](https://bradfrost.com/blog/post/atomic-web-design/#organisms).

Last story of the four column component row supports collection, ad and widget also.

### Import
```jsx
import { ThreeColGrid } from "@quintype/arrow"
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
<ThreeColGrid collection={collection} config={contextConfig} />
```

<!-- PROPS -->
