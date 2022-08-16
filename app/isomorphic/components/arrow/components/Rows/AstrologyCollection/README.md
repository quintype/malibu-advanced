# Astrology Collection Filter

The _AstrologyCollection_ component is a collection of collections in a tabbed interface.

## Usage

### Import

```jsx
import { AstrologyCollection } from "@quintype/arrow";
```

### Setting the Row context

```jsx
const contextConfig = {
  collectionNameBorderColor: color("Collection Name Border Color", collectionNameDefaultValue),
  borderColor: color("Section Tag Border Color", sectionTagDefaultvalue),
  theme: color("color", defaultvalue),
  border: optionalSelect("Border", borderTemplate),
  collectionNameTemplate: optionalSelect("Collection Name Templates", collectionNameTemplates),
  showRowTitle: boolean("Row title", true),
  footerButton: optionalSelect("Footer Button", footerButton),
  buttonText: text("Footer text", "Read More"),
  showButton: boolean("Show button", true),
  slotConfig: [
    {
      type: "ad",
      component: () => <CustomAdOrWidget />
    }
  ]
};
```

### Use as a component

```jsx
<AstrologyCollection collection={collection} config={contextConfig} />
```

