# Four Story Slider

The _FourStorySlider_ component is a slider Row which shows 4 stories at a time on the Desktop and 1 at a time on mobile.

## Usage

### Import

```jsx
import { FourStorySlider } from "@quintype/arrow";
```

### Setting the Row context

```jsx
const contextConfig = {
  collectionNameBorderColor: color(collectionNameBorderColorLabel, collectionNameDefaultValue),
  borderColor: color(sectionTagBorderColor, sectionTagDefaultvalue),
  theme: color(label, defaultvalue),
  border: optionalSelect("Border", borderTemplate),
  collectionNameTemplate: optionalSelect("Collection Name Templates", collectionNameTemplates),
  sectionTagTemplate: optionalSelect("Section Tag Templates", sectionTagTemplates),
  showSection: boolean("section disable", true),
  showAuthor: boolean("Author disable", true),
  showRowTitle: boolean("Row Title disable", true),
  showTime: boolean("Timestamp disable", true),
  footerButton: optionalSelect("Footer Button", footerButton),
  buttonText: text("Footer text", "Read More"),
  numberOfStoriesToShow: number("Number of slide to show", 10),
  navigationArrows: boolean("Arrows enable", true),
  isInfinite: boolean("Autoplay", false),
  slideIndicator: optionalSelect("Slide Indicator", navigationStyle),
  footerSlotConfig: { footerSlot: footerSlot },
  showButton: boolean("Show button", true),
  showReadTime: boolean("Read time", true)
};
```

### Use as a component

```jsx
<FourStorySlider collection={collection} config={contextConfig} />
```

<!-- PROPS -->
