# Two Column Six Stories

The _TwoColSixStories_ component is a two column six stories organism

## Usage

### Import
```jsx
import { TwoColSixStories } from "@quintype/arrow"
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
<TwoColSixStories collection={collection} config={contextConfig} />
```

<!-- PROPS -->
