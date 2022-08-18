# Collection Filter

The _Listicles_ component is a collection of collections in a tabbed interface which showcase onlu story headlines with number.

The last 3 stories can be replaced with an Ad/Widget based on the slotConfig.

## Usage

### Import

```jsx
import { Listicles } from "@quintype/arrow";
```

### Setting the Row context

```jsx
const contextConfig = {
  theme: "#ffffff",
  collectionNameTemplate: "default",
  slotConfig: <CustomAdOrWidget />,
  showRowTitle: true
};
```

### Use as a component

```jsx
<Listicles collection={collection} config={contextConfig} />
```

<!-- PROPS -->
