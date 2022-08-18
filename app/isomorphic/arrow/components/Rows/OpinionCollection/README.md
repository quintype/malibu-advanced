# Opinion Collection

## Usage

### Import

```jsx
import { OpinionCollection } from "@quintype/arrow";
```

### Setting the Row context

```jsx
const contextConfig = {
  theme: "#ffffff",
  showSection: true,
  showAuthor: false,
  showTime: true,
  showFooterButton: true,
  buttonText: "Load More",
  showRowTitle: true
  border: "",
  collectionNameTemplate: "default",
  sectionTagTemplate: "default",
  slotConfig: [{ type: "ad", component: () => <AdOrWidgetComponent /> }],
  footerSlotConfig: { footerSlot: () => <CustomFooterComponent /> }
};
```

### Use as a component

```jsx
<OpinionCollection collection={collection} config={contextConfig} />
```

<!-- PROPS -->
