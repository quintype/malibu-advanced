# Four Column Twelve Stories

The FourColTwelveStories component accepts collection of collections

## Usage

### Import

```jsx
import { FourColTwelveStories } from "@quintype/arrow";
```

### Setting the Row context

```jsx
const otherTextData = {
  text: "hello",
  textColor: "#345678",
  Icon: () => <ReturnCustomIcon />
};

const contextConfig = {
  theme: "#ffffff",
  border: "",
  footerSlotConfig: { footerSlot: () => <CustomFooterSlot /> },
  showSection: true,
  showAuthor: true,
  showTime: true,
  showRowTitle: true,
  collectionNameTemplate: "default",
  showSubheadline: true
};
```

### Use as a component

```jsx
<FourColTwelveStories collection={collection} config={contextConfig} otherTextData={otherTextData} />
```
