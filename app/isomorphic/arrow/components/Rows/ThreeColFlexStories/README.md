# Three Col FlexStories

The _ThreeColFlexStories_ component is a three column grid with a more compressed arrangement

## Usage

### Import

```jsx
import { ThreeColFlexStories } from "@quintype/arrow";
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
  withseparator: true,
  showFooterButton: false,
  buttonText: "Read More",
  slotConfig: [{ type: "story", component: () => <AdOrWidgetComponent /> }]
};
```

### Use as a component

```jsx
<ThreeColFlexStories collection={collection} config={contextConfig} />
```

<!-- PROPS -->
