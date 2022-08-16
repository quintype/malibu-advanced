# Two Column Ten Stories Sidebar

The _TwoColTenStoriesSidebar_ component accepts collection of stories.

### Import

```jsx
import { TwoColTenStoriesSidebar } from "@quintype/arrow";
```

### Setting the Row context

```jsx
const contextConfig = {
  theme: "#ffffff",
  collectionNameTemplate: "default",
  sectionTagTemplate: "default",
  showSection: true,
  showAuthor: true,
  showTime: true,
  showRowTitle: true,
  showFooterButton: true,
  buttonText: "Load More",
  slotConfig: [{ type: "ad", component: () => <CustomAdOrWidget /> }]
};
```

### Use as a component

```jsx
<TwoColTenStoriesSidebar collection={collection} config={contextConfig} />
```

<!-- PROPS -->
