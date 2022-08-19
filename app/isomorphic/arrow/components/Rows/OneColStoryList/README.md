# One Column Story List

The _OneColStoryList_ component is a basic [row](https://bradfrost.com/blog/post/atomic-web-design/#organisms) with a list of storycards.

## Usage

### Import
```jsx
import { OneColStoryList } from "@quintype/arrow"
```

### Setting the Row context

```jsx
const contextConfig = {
  theme: "#ffffff",
  collectionNameTemplate: "default",
  sectionTagTemplate: "default",
  border: "bottom",
  showSection: true,
  showAuthor: true,
  showTime: true,
  slotConfig: [{ type: "ad", component: () => <CustomAdOrWidget /> }],
  showFooterButton: true,
  buttonText: "Load More",
  showRowTitle: true,
  footerSlotConfig: { footerSlot: () => <CustomFooterComponent /> }
};
```

### Use as a component

#### Default Usage
```jsx
<OneColStoryList story={story} theme="#ffffff" />
```

#### OneColStoryList with border bottom

```jsx
<OneColStoryList story={story} border="bottom" theme="#ffffff"/>
```

#### OneColStoryList with full border

```jsx
<OneColStoryList story={story} border="full" theme="#ffffff">
```
