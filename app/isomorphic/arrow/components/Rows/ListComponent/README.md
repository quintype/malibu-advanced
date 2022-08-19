# List Stories

The _ListComponent_ component is a basic [row](https://bradfrost.com/blog/post/atomic-web-design/#organisms) with a list of storycards.

## Usage

### Import

```jsx
import { ListComponent } from "@quintype/arrow";
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
  showFooterButton: true,
  buttonText: "Load More",
  showRowTitle: true
};
```

### Use as a component

#### Default Usage

```jsx
<ListComponent story={story} />
```

#### ListComponent with border bottom

```jsx
<ListComponent story={story} border="bottom" />
```

#### ListComponent with full border

```jsx
<ListComponent story={story} border="full">
```
