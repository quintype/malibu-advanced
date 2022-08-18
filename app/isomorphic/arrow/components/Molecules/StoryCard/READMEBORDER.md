# StoryCard

The _StoryCard_ component with different kinds of borders and box shadow modules used to represent a story within a Row with borders.

The _StoryCard_ can be composible based on it's children(Atoms).

### Default Story Card with Full Border

```jsx
<StoryCard story={story} border="full" />
```

### Default Story Card with Border Bottom

```jsx
<StoryCard story={story} border="bottom" />
```

### Default Story Card with Box Shadow

```jsx
<StoryCard story={story} border="box" />
```

### StoryCard using StoryCardContent

```jsx
<StoryCard story={story} border="full">
  <HeroImage story={story} />
  <StorycardContent story={story}>
    <Headline story={story} />
    <AuthorWithTime story={story} />
  </StorycardContent>
</StoryCard>
```

### StoryCard using StoryCardContent border Box and fullBleed False

```jsx
<StoryCard story={story} border="box">
  <HeroImage story={story} FullBleed={false} />
  <StorycardContent story={story}>
    <Headline story={story} />
    <AuthorWithTime story={story} />
  </StorycardContent>
</StoryCard>
```

### Horizontal StoryCard using StoryCardContent border full

```jsx
<StoryCard story={story} border="full" isHorizontal>
  <HeroImage story={story} />
  <StorycardContent story={story}>
    <Headline story={story} />
    <AuthorWithTime story={story} />
  </StorycardContent>
</StoryCard>
```

<!-- PROPS -->
