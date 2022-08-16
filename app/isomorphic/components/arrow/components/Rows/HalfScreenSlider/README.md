# Half Screen Slider

The _HalfScreenSlider_ component is a slider Row which shows 1 story at a time on desktop and mobile. It is a variation of the Full Screen Slider with a different story card.

## Usage

### Import

```jsx
import { HalfScreenSlider } from "@quintype/arrow";
```

### Setting the Row context

```jsx
const contextConfig = {
  collectionNameBorderColor: color(collectionNameBorderColorLabel, collectionNameDefaultValue),
  borderColor: color(sectionTagBorderColor, sectionTagDefaultvalue),
  theme: color(label, defaultvalue),
  border: optionalSelect("Border", borderTemplate),
  showSection: boolean("section disable", true),
  showAuthor: boolean("Author disable", true),
  showTime: boolean("Timestamp disable", true),
  showRowTitle: boolean("Row title", true),
  footerButton: optionalSelect("Footer Button", footerButton),
  collectionNameTemplate: optionalSelect("Collection row Templates", collectionNameTemplates),
  sectionTagTemplate: optionalSelect("Section Tag Templates", sectionTagTemplates),
  buttonText: text("Footer text"),
  slideIndicator: optionalSelect("Slide Indicator", navigationStyle),
  navigationArrows: boolean("Arrows enable", true),
  isInfinite: boolean("Autoplay", false),
  numberOfStoriesToShow: number("Number of slide to show", 3),
  footerSlotConfig: { footerSlot: footerSlot },
  showButton: boolean("Show button", true),
  showReadTime: boolean("Read time", true)
};
```

```jsx
<HalfScreenSlider collection={collection} config={contextConfig} />
```

<!-- PROPS -->
