# Two Column Four Story Highlight

The _TwoColFourStoryHighlight_ component accepts collection of stories.

### Import
```jsx
import { TwoColFourStoryHighlight } from "@quintype/arrow"
```

### Setting the Row context

```jsx
const contextConfig = {
  theme: "#ffffff",
  showBorder: true,
  collectionNameTemplate: "default",
  sectionTagTemplate: "default",
  showSection: true,
  showAuthor: true,
  showTime: true,
  showRowTitle: true,
  showFooterButton: true,
  buttonText: "Load More",
  customBulletColor: "#ffffff",
  showBullet: true,
  bulletColorType: "default"
};
```

### Use as a component
```jsx
<TwoColFourStoryHighlight collection={collection} config={contextConfig} />
```

<!-- PROPS -->
