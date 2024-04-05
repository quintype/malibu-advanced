# Six Col Six Stories

The _SixColSixStories_ component is a six column grid with six stories

## Usage

### Import

```jsx
import { SixColSixStories } from "@quintype/arrow";
```

### Setting the Row context

```jsx
const contextConfig = {
  theme: "#ffffff",
  collectionNameTemplate: "borderLeft",
  sectionTagTemplate: "borderBottomSml",
  showSection: true,
  showRowTitle: true,
  showAuthor: true,
  showTime: true,
  showSubheadline: true,
  showFooterButton: false,
  buttonText: "Read More",
  border: "fullBorder"
  showCardBgColor: false,
  cardBgColor: "#ffffff"
};
```

### Use as a component

```jsx
<SixColSixStories collection={collection} config={contextConfig} />
```

<!-- PROPS -->
