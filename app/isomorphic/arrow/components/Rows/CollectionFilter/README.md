# Collection Filter

The _CollectionFilter_ component is a collection of collections in a tabbed interface.

The last 3 stories can be replaced with an Ad/Widget based on the slotConfig.

## Usage

### Import 
```jsx
import { CollectionFilter } from "@quintype/arrow";
```

### Setting the Row context

```jsx
const contextConfig = {
  theme: "#ffffff",
  border: "",
  collectionNameTemplate: "default",
  sectionTagTemplate: "solid",
  showSection: true,
  showAuthor: true,
  showTime: true,
  slotConfig: [{ type: "story", component: () => <CustomAdOrWidget /> }],
  showRowTitle: true,
  showFooterButton: true,
  buttonText: "Load More",
  footerSlotConfig: { footerSlot: () => <CustomFooterSlot /> }
};
```

### Use as a component

```jsx
<CollectionFilter collection={collection} config={contextConfig} />
```

<!-- PROPS -->
