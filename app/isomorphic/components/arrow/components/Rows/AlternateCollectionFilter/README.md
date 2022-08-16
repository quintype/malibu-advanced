# Alternate Collection Filter

The _AlternateCollectionFilter_ component is a collection of collections in a tabbed interface.

## Usage

### Import

```jsx
import { AlternateCollectionFilter } from "@quintype/arrow";
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
<AlternateCollectionFilter collection={collection} config={contextConfig} />
```

<!-- PROPS -->
