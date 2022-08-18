# Full Screen Slider

The _FullScreenSlider_ component is a slider Row which shows 1 story at a time on desktop and mobile.

## Usage

### Import

```jsx
import { FullScreenSlider } from "@quintype/arrow";
```

### Setting the Row context

```jsx
const contextConfig = {
  collectionNameBorderColor: color(collectionNameBorderColorLabel, collectionNameDefaultValue),
  borderColor: color(sectionTagBorderColor, sectionTagDefaultvalue),
  theme: color(label, defaultvalue),
  collectionNameTemplate: optionalSelect("Collection Templates", collectionNameTemplates),
  sectionTagTemplate: optionalSelect("Section Tag Templates", sectionTagTemplates),
  showSection: boolean("section disable", true),
  showAuthor: boolean("Author disable", true),
  showRowTitle: boolean("Row Title disable", true),
  showTime: boolean("Timestamp disable", true),
  showSubheadline: boolean("subheadline enable ", false),
  isFullWidth: boolean("isFullWidth", false),
  numberOfStoriesToShow: number("Number of slide to show", 8),
  isInfinite: boolean("Autoplay", false),
  slideIndicator: optionalSelect("Slide Indicator", navigationStyle),
  navigationArrows: boolean("Arrows enable", true),
  contentAlignment: optionalSelect("content alignment", contentAlignment),
  footerButton: optionalSelect("Footer Button", footerButton),
  footerSlotConfig: { footerSlot: footerSlot },
  showButton: boolean("Show button", true),
  showReadTime: boolean("Read time", true)
};
```

### Use as a component

```jsx
<FullScreenSlider collection={collection} config={contextConfig} />
```

<!-- PROPS -->
