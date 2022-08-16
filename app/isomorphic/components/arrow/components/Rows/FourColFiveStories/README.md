# Four Column Five Stories Grid

The _FourColGrid_ component is a basic four column five stories storycard.

Last story of the four column grid supports an ad/widget slot.

## Usage

### Import
```jsx
import { FourColFiveStories } from "@quintype/arrow"
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
};
```

### Use as a component
```jsx
<FourColFiveStories collection={collection} config={contextConfig} />
```

<!-- PROPS -->
