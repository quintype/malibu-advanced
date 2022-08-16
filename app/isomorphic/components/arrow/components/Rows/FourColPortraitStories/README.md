# Four Col Portrait Stories

The _FourColPortraitStories_ component is a basic four column portrait storycard [row](https://bradfrost.com/blog/post/atomic-web-design/#organisms).

## Usage

### Import

```jsx
import { FourColPortraitStories } from "@quintype/arrow";
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
  footerSlotConfig: { footerSlot: () => <FooterComponent /> },
  subsequentLoadCount: 8
};
```

### Use as a component

```jsx
<FourColPortraitStories collection={collection} config={contextConfig} />
```

<!-- PROPS -->
