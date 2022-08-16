# Three Column Seven Stories

The _ThreeColSevenStory_ component is a three column [row](https://bradfrost.com/blog/post/atomic-web-design/#organisms)

## Usage

### Import 
```jsx
import { ThreeColSevenStory } from "@quintype/arrow" 
```

### Setting the Row context 

```jsx
const contextConfig = {
  theme: "#ffffff",
  showSection: true,
  showAuthor: true,
  showTime: true,
  showFooterButton: true,
  buttonText: "Load More",
  showRowTitle: true
  border: "",
  collectionNameTemplate: "default",
  sectionTagTemplate: "default",
  slotConfig: [{ type: "story", component: () => <AdOrWidgetComponent /> }],
  footerSlotConfig: { footerSlot: () => <CustomFooterComponent /> }
};
```

### Use as a component
```jsx
<ThreeColSevenStory collection={collection} config={contextConfig} />
```

<!-- PROPS -->