# ThreeColFourteenStories(Row/Organisms)

The _ThreeColFourteenStories_ component is a basic [row](https://bradfrost.com/blog/post/atomic-web-design/#organisms) used to represent a Row with storycards.

The _Row/Organisms_ can be composible based on it's children(Atoms/molecules) or using StoryCardContent component(molecule)

Last column of the ThreeColFourteenStories row supports stories, ad and widget also

## Usage

### Default ThreeColFourteenStories

```jsx
const contextConfig = {
  theme: '#ffff',
  border: 'bottom',
  showSection: true,
  showAuthor: true,
  showTime: false,
  showRowTitle: true,
  showSubheadline: false,
  slotConfig: [{ type: "story"}]
};
```

```jsx
<ThreeColFourteenStories collection={collection} config={contextConfig} />
```
