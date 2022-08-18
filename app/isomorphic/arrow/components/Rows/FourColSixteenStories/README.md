# Four Col Sixteen Stories

The _FourColSixteenStories_ component accepts collection of collections.

## Usage

### Import
```jsx
import { FourColSixteenStories } from "@quintype/arrow"
```

### Setting the Row context

```jsx
const contextConfig = {
  theme: "#ffffff",
  collectionNameTemplate: "default",
  sectionTagTemplate: "solid",
  showSection: true,
  showRowTitle: true,
  showAuthor: true,
  showTime: true,
  showSubheadline: true,
  withseparator: true,
  showFooterButton: false,
  buttonText: "Read More",
};
```

### Use as a component
```jsx
<FourColSixteenStories collection={collection} config={contextConfig} />
```

<!-- PROPS -->
